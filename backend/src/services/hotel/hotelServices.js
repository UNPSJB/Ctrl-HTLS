const Hotel = require('../../models/hotel/Hotel');
const {
  verificarCiudad,
  verificarDireccion,
  verificarEmail,
  verificarTelefono,
} = require('../../utils/helpers');
const CustomError = require('../../utils/CustomError');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const Categoria = require('../../models/hotel/Categoria');
const Encargado = require('../../models/hotel/Encargado');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const Ciudad = require('../../models/core/Ciudad');
const Provincia = require('../../models/core/Provincia');
const Pais = require('../../models/core/Pais');
const Habitacion = require('../../models/hotel/Habitacion');

const crearHotel = async (
  nombre,
  direccion,
  telefono,
  email,
  tipoHabitaciones,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  await verificarCiudad(ciudadId);

  await verificarHotel(
    nombre,
    ciudadId,
    direccion,
    email,
    telefono,
    encargadoId,
    categoriaId,
  );
  let nuevoHotel = {};
  try {
    // Crear el nuevo hotel
    nuevoHotel = await Hotel.create({
      nombre,
      direccion,
      telefono,
      email,
      ciudadId,
      encargadoId,
      categoriaId,
    });

    await asignarTipoHabitaciones(nuevoHotel.id, tipoHabitaciones);

    // Obtener los tipos de habitaciones asignadas con su precio
    const tiposHabitacionesAsignadas = await getTiposHabitacionesHotel(
      nuevoHotel.id,
    );

    // Obtener el nombre del encargado
    const nombreEncargado = await getNombreEncargado(encargadoId);

    // Obtener los datos completos de la categoría
    const categoriaCompleta = await getCategoriaById(categoriaId);

    // Obtener la ciudad con su respectiva provincia y país
    const ciudadCompleta = await getCiudadCompleta(ciudadId);

    return {
      ...nuevoHotel.toJSON(),
      tipoHabitaciones: tiposHabitacionesAsignadas,
      nombreEncargado,
      categoriaCompleta,
      ciudadCompleta,
    };
  } catch (error) {
    await nuevoHotel.destroy();
    throw error;
  }
};

const asignarTipoHabitaciones = async (hotelId, tipoHabitaciones) => {
  // Verificar que los IDs de los tipos de habitación existan y no sean duplicados
  await verificarTiposHabitacion(tipoHabitaciones);

  for (const tipoHabitacion of tipoHabitaciones) {
    const { idTipoHabitacion, precio } = tipoHabitacion;

    // Crear la relación en la tabla intermedia
    await HotelTipoHabitacion.create({
      hotelId,
      tipoHabitacionId: idTipoHabitacion,
      precio,
    });
  }
};

const modificarHotel = async (
  id,
  nombre,
  direccion,
  telefono,
  email,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  await verificarCiudad(ciudadId);

  await verificarHotel(
    nombre,
    ciudadId,
    direccion,
    email,
    telefono,
    encargadoId,
    categoriaId,
  );

  hotel.nombre = nombre;
  hotel.direccion = direccion;
  hotel.telefono = telefono;
  hotel.email = email;
  hotel.ciudadId = ciudadId;
  hotel.encargadoId = encargadoId;
  hotel.categoriaId = categoriaId;

  await hotel.save();
  return hotel;
};

// Obtener los tipos de habitaciones de un hotel
const getTiposHabitacionesHotel = async (idHotel) => {
  // Obtener los registros de la tabla intermedia
  const tiposHabitacionesAsignadas = await HotelTipoHabitacion.findAll({
    where: { hotelId: idHotel },
  });

  // Obtener los IDs de los tipos de habitación
  const idsTipoHabitacion = tiposHabitacionesAsignadas.map(
    (th) => th.tipoHabitacionId,
  );

  // Obtener los nombres de los tipos de habitación
  const tiposHabitacion = await TipoHabitacion.findAll({
    where: { id: idsTipoHabitacion },
    attributes: ['id', 'nombre'],
  });

  // Crear un mapa para acceder rápidamente a los nombres de los tipos de habitación
  const mapaTiposHabitacion = tiposHabitacion.reduce((mapa, tipo) => {
    mapa[tipo.id] = tipo.nombre;
    return mapa;
  }, {});

  // Combinar los datos y devolver el resultado
  return tiposHabitacionesAsignadas.map((th) => ({
    idTipoHabitacion: th.tipoHabitacionId,
    precio: th.precio,
    nombre: mapaTiposHabitacion[th.tipoHabitacionId],
  }));
};

const getNombreEncargado = async (encargadoId) => {
  const encargado = await Encargado.findByPk(encargadoId, {
    attributes: ['nombre', 'apellido'],
  });

  if (!encargado) {
    throw new CustomError('El encargado no existe', 404); // Not Found
  }

  return `${encargado.nombre} ${encargado.apellido}`;
};

const getCategoriaById = async (categoriaId) => {
  const categoria = await Categoria.findByPk(categoriaId);

  if (!categoria) {
    throw new CustomError('La categoría no existe', 404); // Not Found
  }

  return categoria;
};

const getCiudadCompleta = async (ciudadId) => {
  const ciudad = await Ciudad.findByPk(ciudadId, {
    include: [
      {
        model: Provincia,
        as: 'provincia',
        include: [
          {
            model: Pais,
            as: 'pais',
          },
        ],
      },
    ],
  });

  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }

  return ciudad;
};

const obtenerCategorias = async () => {
  // Obtener todas las categorías de los hoteles
  const categorias = await Categoria.findAll();

  return categorias;
};

const verificarHotel = async (
  nombre,
  ciudadId,
  direccion,
  email,
  telefono,
  encargadoId,
  categoriaId,
) => {
  // Verificar si ya existe un hotel con el mismo nombre en la misma ciudad
  const hotelExistenteNombre = await Hotel.findOne({
    where: { nombre, ciudadId },
  });
  if (hotelExistenteNombre) {
    throw new CustomError(
      'Ya existe un hotel con el mismo nombre en esta ciudad',
      409,
    ); // Conflict
  }
  const encargadoExistente = await Encargado.findByPk(encargadoId);
  if (!encargadoExistente) {
    throw new CustomError('El encargado no existe', 404); // Not Found
  }
  const encargadoHotelExistente = await Hotel.findOne({
    where: { encargadoId },
  });
  if (encargadoHotelExistente) {
    throw new CustomError('El encargado ya tiene un hotel asignado', 409); // Conflict
  }
  const categoriaExistente = await Categoria.findByPk(categoriaId);
  if (!categoriaExistente) {
    throw new CustomError('La categoría no existe', 404); // Not Found
  }

  await verificarDireccion(direccion, ciudadId);
  await verificarEmail(email);
  await verificarTelefono(telefono);
};

const verificarTiposHabitacion = async (tipoHabitaciones) => {
  const idsTipoHabitacion = tipoHabitaciones.map((th) => th.idTipoHabitacion);

  // Verificar si hay IDs duplicados
  const idsUnicos = new Set(idsTipoHabitacion);
  if (idsUnicos.size !== idsTipoHabitacion.length) {
    throw new CustomError(
      'No puedes asignar tipos de habitacion repetidos.',
      400,
    ); // Bad Request
  }

  // Verificar si todos los tipos de habitación existen
  const tiposHabitacionExistentes = await TipoHabitacion.findAll({
    where: { id: idsTipoHabitacion },
    attributes: ['id'],
  });

  if (tiposHabitacionExistentes.length !== idsTipoHabitacion.length) {
    throw new CustomError(
      'Uno o más IDs de tipos de habitación no existen',
      404,
    ); // Not Found
  }
};

const agregarHabitaciones = async (idHotel, habitaciones) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  // Verificar si todos los tipos de habitación existen
  const idsTipoHabitacion = habitaciones.map((h) => h.idTipoHabitacion);
  await Promise.all(
    idsTipoHabitacion.map(async (idTipoHabitacion) => {
      const tipoHabitacionEncontrado = await verificarTipoHabitacion(
        idTipoHabitacion,
        idHotel,
      );
      if (!tipoHabitacionEncontrado) {
        throw new CustomError(
          `El tipo de habitación con ID ${idTipoHabitacion} no existe`,
          404,
        ); // Not Found
      }
    }),
  );

  // Verificar límites de habitaciones y pisos
  await verificarLimitesHabitaciones(idHotel, habitaciones);

  // Verificar si hay números de habitaciones duplicados
  const numerosHabitacion = habitaciones.map((h) => h.numero);
  const numerosUnicos = new Set(numerosHabitacion);
  if (numerosUnicos.size !== numerosHabitacion.length) {
    throw new CustomError(
      'No puedes asignar números de habitaciones repetidos.',
      400,
    ); // Bad Request
  }

  // Verificar si el número de habitación y piso ya están guardados en el mismo hotel
  for (const habitacion of habitaciones) {
    const habitacionExistente = await Habitacion.findOne({
      where: {
        hotelId: idHotel,
        numero: habitacion.numero,
      },
    });
    if (habitacionExistente) {
      throw new CustomError(
        `La habitación número ${habitacion.numero} ya existe en este hotel.`,
        409,
      ); // Conflict
    }
  }

  // Crear las habitaciones
  for (const habitacion of habitaciones) {
    await Habitacion.create({
      hotelId: idHotel,
      numero: habitacion.numero,
      piso: habitacion.piso,
      tipoHabitacionId: habitacion.idTipoHabitacion,
    });
  }
  return obtenerHabitaciones(idHotel);
};

const obtenerHabitaciones = async (idHotel) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  // Obtener las habitaciones del hotel
  const habitaciones = await Habitacion.findAll({
    where: { hotelId: idHotel },
    attributes: ['numero', 'piso', 'tipoHabitacionId'],
    include: [
      {
        model: TipoHabitacion,
        as: 'tipoHabitacion',
        attributes: ['nombre'],
      },
    ],
  });

  // Obtener los precios de los tipos de habitación desde la tabla intermedia
  const precios = await HotelTipoHabitacion.findAll({
    where: { hotelId: idHotel },
    attributes: ['tipoHabitacionId', 'precio'],
  });

  // Crear un mapa para acceder rápidamente a los precios por tipo de habitación
  const mapaPrecios = precios.reduce((mapa, precio) => {
    mapa[precio.tipoHabitacionId] = precio.precio;
    return mapa;
  }, {});

  // Agregar el precio al objeto de cada habitación
  const habitacionesConPrecio = habitaciones.map((habitacion) => ({
    ...habitacion.toJSON(),
    precio: mapaPrecios[habitacion.tipoHabitacionId],
  }));

  return habitacionesConPrecio;
};

//Verificar que existe el tipo de habitación
const verificarTipoHabitacion = async (idTipoHabitacion, idHotel) => {
  const tipoHabitacion = await TipoHabitacion.findByPk(idTipoHabitacion);
  if (!tipoHabitacion) {
    throw new CustomError(
      `El tipo habitación ID ${idTipoHabitacion} no existe en este hotel.`,
      409,
    ); // Not Found
  }

  // Verificar que el hotel tenga asignado el tipo de habitación
  const hotelTipoHabitacionExistente = await HotelTipoHabitacion.findOne({
    where: {
      hotelId: idHotel,
      tipoHabitacionId: idTipoHabitacion,
    },
  });
  if (!hotelTipoHabitacionExistente) {
    throw new CustomError(
      `El hotel no tiene asignado el tipo de habitación con ID ${idTipoHabitacion}`,
      400,
    ); // Bad Request
  }

  return tipoHabitacion;
};

const verificarLimitesHabitaciones = async (idHotel, habitaciones) => {
  // Verificar el número de habitaciones en el hotel
  const totalHabitaciones = await Habitacion.count({
    where: { hotelId: idHotel },
  });
  if (totalHabitaciones + habitaciones.length > 1000) {
    throw new CustomError(
      'No puedes tener más de 1000 habitaciones en un solo hotel.',
      400,
    ); // Bad Request
  }

  // Verificar que el número de piso esté entre 1 y 150
  for (const habitacion of habitaciones) {
    if (habitacion.piso < 1 || habitacion.piso > 150) {
      throw new CustomError(
        `El número de piso ${habitacion.piso} no es válido. Debe estar entre 1 y 150.`,
        400,
      ); // Bad Request
    }
  }
};

module.exports = {
  crearHotel,
  modificarHotel,
  obtenerCategorias,
  agregarHabitaciones,
};
