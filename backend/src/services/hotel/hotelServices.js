const Hotel = require('../../models/hotel/Hotel');
const {
  verificarCiudad,
  verificarDireccion,
  verificarEmail,
  verificarTelefono,
  verificarTiposHabitacion,
} = require('../../utils/helpers');
const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const Categoria = require('../../models/hotel/Categoria');
const Encargado = require('../../models/hotel/Encargado');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const Ciudad = require('../../models/core/Ciudad');
const Provincia = require('../../models/core/Provincia');
const Pais = require('../../models/core/Pais');
const Habitacion = require('../../models/hotel/Habitacion');
const Alquiler = require('../../models/ventas/Alquiler');
const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');

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

//IMPLEMENTAR
const eliminarHotel = async (id) => {};

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

//TERMINAR
const agregarPaquetePromocional = async (idHotel, paquete) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  for (const idHabitacion of paquete.habitaciones) {
    const habitacion = await Habitacion.findOne({
      where: {
        hotelId: idHotel,
        id: idHabitacion,
      },
    });
    if (!habitacion) {
      throw new CustomError(
        `La habitación con ID ${idHabitacion} no existe o no pertenece al hotel`,
        404,
      ); // Not Found
    }

    // Verificar si la habitación ya está asociada al paquete promocional
    const paqueteExistente = await PaquetePromocionalHabitacion.findOne({
      where: {
        habitacionId: idHabitacion,
        paquetePromocionalId: paquete.idPaquetePromocional,
      },
    });
    if (paqueteExistente) {
      throw new CustomError(
        `La habitación con ID ${idHabitacion} ya está asociada a este paquete promocional`,
        409,
      ); // Conflict
    }
  }
  //IMPLEMENTAR
  await verificarAlquilada(
    idHotel,
    paquete.habitaciones,
    paquete.fechaInicio,
    paquete.fechaFin,
  );

  // Verificar si el paquete promocional existe
  const paquetePromocional = await PaquetePromocional.findByPk(
    paquete.idPaquetePromocional,
  );
  if (!paquetePromocional) {
    throw new CustomError('El paquete promocional no existe', 404); // Not Found
  }

  // Verificar si la habitación ya está asociada al paquete promocional
  const paqueteExistente = await PaquetePromocionalHabitacion.findOne({
    where: {
      habitacionId: paquete.idHabitacion,
      paquetePromocionalId: paquete.idPaquetePromocional,
    },
  });
  if (paqueteExistente) {
    throw new CustomError(
      'La habitación ya está asociada a este paquete promocional',
      409,
    ); // Conflict
  }

  // Crear la relación en la tabla intermedia
  await PaquetePromocionalHabitacion.create({
    habitacionId: paquete.idHabitacion,
    paquetePromocionalId: paquete.idPaquetePromocional,
    fechaInicio: paquete.fechaInicio,
    fechaFin: paquete.fechaFin,
  });

  return obtenerPaquetesPromocionales(idHotel);
};

module.exports = {
  crearHotel,
  modificarHotel,
  obtenerCategorias,
};
