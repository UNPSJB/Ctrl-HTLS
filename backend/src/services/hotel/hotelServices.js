const Hotel = require('../../models/hotel/Hotel');
const {
  verificarCiudad,
  verificarDireccion,
  verificarEmail,
  verificarTelefono,
  verificarTiposHabitacion,
  verificarIdHotel,
  verificarFechas,
  verificarPorcentaje,
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
const paquetePromocionalServices = require('./paquetePromocionalServices');
const { verificarHabitacionesHotel } = require('./habitacionServices');
const temporadaServices = require('./temporadaServices');
const descuentoServices = require('./descuentoServices');
const { get } = require('../../routes/ventas/alquilerRoutes');

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

  await verificarIdHotel(idHotel);
  await verificarHabitacionesHotel(idHotel, paquete.habitaciones);
  await verificarFechas(paquete.fecha_inicio, paquete.fecha_fin);
  await verificarAlquilada(
    paquete.habitaciones,
    paquete.fechaInicio,
    paquete.fechaFin,
  );

  const paqueteCreado = await paquetePromocionalServices.crearPaquete(
    idHotel,
    paquete,
  );

  // Crear la relación en la tabla intermedia
  const paqueteCompleto =
    await paquetePromocionalServices.asignarHabitacionAPaquete(
      paqueteCreado,
      paquete,
    );

  return paqueteCompleto;
  // return obtenerPaquetesPromocionales(idHotel);
};

const agregarTemporada = async (idHotel, temporada) => {
  // Verificar si el hotel existe
  await verificarIdHotel(idHotel);
  // Verificar si las fechas son correctas
  await verificarFechas(temporada.fechaInicio, temporada.fechaFin);
  await temporadaServices.verificarTemporadas(
    idHotel,
    temporada.fechaInicio,
    temporada.fechaFin,
  );

  await verificarPorcentaje(temporada.porcentaje);

  // Crear la relación en la tabla intermedia
  const temporadaNueva = temporadaServices.crearTemporada(idHotel, temporada);

  return temporadaNueva;
};

const agregarDescuentos = async (idHotel, descuento) => {
  // Verificar si el hotel existe
  await verificarIdHotel(idHotel);

  await verificarPorcentaje(descuento.porcentaje);
  // Verificar si las fechas son correctas
  await descuentoServices.verificarDescuentoExistente(idHotel, descuento);

  // Crear la relación en la tabla intermedia
  const descuentoNuevo = await descuentoServices.crearDescuento(
    idHotel,
    descuento,
  );

  return descuentoNuevo;
};

const verificarAlquilada = async (habitaciones, fechaInicio, fechaFin) => {
  for (const idHabitacion of habitaciones) {
    const alquileres = await AlquilerHabitacion.findAll({
      where: {
        habitacionId: idHabitacion,
        [Op.or]: [
          {
            fechaInicio: {
              [Op.between]: [fechaInicio, fechaFin],
            },
          },
          {
            fechaFin: {
              [Op.between]: [fechaInicio, fechaFin],
            },
          },
          {
            [Op.and]: [
              {
                fechaInicio: {
                  [Op.lte]: fechaInicio,
                },
              },
              {
                fechaFin: {
                  [Op.gte]: fechaFin,
                },
              },
            ],
          },
        ],
      },
    });

    if (alquileres.length > 0) {
      throw new CustomError(
        `La habitación con ID ${idHabitacion} ya está alquilada en ese rango de fechas`,
        409,
      ); // Conflict
    }
  }
};

/**
 * VERIFICAR QUE EXISTAN HOTELES EN LA CIUDAD
 * QUE TENGA HABITACIONES
 * QUE TENGA HABITACIONES DISPOBIBLES
 * BUSCAR PAQUETES QUE COINCIDAN CON LAS FECHAS
 */
const getHabitacionesDisponibles = async (
  ubicacion,
  fechaInicio,
  fechaFin,
  pasajeros,
) => {
  //Hoteles de una ciudad
  const hotelesCiudad = await Hotel.findAll({
    where: { ciudadId: ubicacion },
  });

  if (hotelesCiudad.length === 0) {
    throw new CustomError('No hay hoteles en la ciudad especificada', 404); // Not Found
  }

  const idsHoteles = hotelesCiudad.map((h) => h.id);

  //Habitaciones de los hoteles de una ciudad
  let habitaciones = [];
  let habitacionesDisponibles = [];
  // Recorrer cada hotel para obtener las habitaciones disponibles
  for (const idHotel of idsHoteles) {
    const habitacionesHotel = await Habitacion.findAll({
      where: { hotelId: idHotel },
      include: [
        {
          model: TipoHabitacion,
          as: 'tipoHabitacion',
          where: {
            capacidad: {
              [Op.gte]: pasajeros,
            },
          },
          attributes: ['nombre', 'capacidad'],
        },
      ],
    });
    habitaciones.push(...habitacionesHotel); // Agregar sin sobrescribir
  }

  //Filtrar las habitaciones que no están ocupadas en el rango de fechas especificado
  for (const habitacion of habitaciones) {
    const ocupada = await verificarOcupada(
      habitacion.id,
      fechaInicio,
      fechaFin,
    );
    if (!ocupada) {
      habitacionesDisponibles.push(habitacion);
    }
  }

  return habitacionesDisponibles;
};

const verificarOcupada = async (idHabitacion, fechaInicio, fechaFin) => {
  const alquileres = await AlquilerHabitacion.findAll({
    where: {
      habitacionId: idHabitacion,
      [Op.or]: [
        {
          fechaInicio: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
        {
          fechaFin: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
        {
          [Op.and]: [
            {
              fechaInicio: {
                [Op.lte]: fechaInicio,
              },
            },
            {
              fechaFin: {
                [Op.gte]: fechaFin,
              },
            },
          ],
        },
      ],
    },
  });
  const paquetes = await PaquetePromocionalHabitacion.findAll({
    where: {
      habitacionId: idHabitacion,
      [Op.or]: [
        {
          fechaInicio: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
        {
          fechaFin: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
        {
          [Op.and]: [
            {
              fechaInicio: {
                [Op.lte]: fechaInicio,
              },
            },
            {
              fechaFin: {
                [Op.gte]: fechaFin,
              },
            },
          ],
        },
      ],
    },
  });

  return alquileres.length > 0 || paquetes.length > 0;
};

const getPaquetesDisponibles = async (
  ubicacion,
  fechaInicio,
  fechaFin,
  pasajeros,
) => {
  // Obtener los hoteles en la ubicación especificada
  const hotelesCiudad = await Hotel.findAll({
    where: { ciudadId: ubicacion },
  });

  if (hotelesCiudad.length === 0) {
    throw new CustomError('No hay hoteles en la ciudad especificada', 404); // Not Found
  }

  const idsHoteles = hotelesCiudad.map((h) => h.id);

  // Inicializar un array para almacenar los paquetes disponibles
  let paquetesDisponibles = [];

  // Recorrer cada hotel para obtener los paquetes disponibles
  for (const idHotel of idsHoteles) {
    const paquetesHotel = await PaquetePromocional.findAll({
      where: { hotelId: idHotel },
      include: [
        {
          model: Habitacion,
          as: 'habitaciones',
          include: [
            {
              model: TipoHabitacion,
              as: 'tipoHabitacion',
              attributes: ['nombre', 'capacidad'],
            },
          ],
        },
      ],
    });

    // Filtrar los paquetes que no están ocupados en el rango de fechas especificado
    for (const paquete of paquetesHotel) {
      const habitaciones = paquete.habitaciones;
      const capacidadTotal = habitaciones.reduce((total, habitacion) => {
        return total + habitacion.tipoHabitacion.capacidad;
      }, 0);

      if (capacidadTotal >= pasajeros) {
        const ocupada = await verificarOcupadaPaquete(
          paquete.id,
          fechaInicio,
          fechaFin,
        );
        if (!ocupada) {
          paquetesDisponibles.push(paquete);
        }
      }
    }
  }

  return paquetesDisponibles;
};

const verificarOcupadaPaquete = async (idPaquete, fechaInicio, fechaFin) => {
  const habitacionesPaquete = await PaquetePromocionalHabitacion.findAll({
    where: {
      paquetePromocionalId: idPaquete,
      [Op.or]: [
        {
          fechaInicio: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
        {
          fechaFin: {
            [Op.between]: [fechaInicio, fechaFin],
          },
        },
        {
          [Op.and]: [
            {
              fechaInicio: {
                [Op.lte]: fechaInicio,
              },
            },
            {
              fechaFin: {
                [Op.gte]: fechaFin,
              },
            },
          ],
        },
      ],
    },
  });

  return habitacionesPaquete.length > 0;
};

module.exports = {
  crearHotel,
  modificarHotel,
  obtenerCategorias,
  agregarPaquetePromocional,
  agregarTemporada,
  agregarDescuentos,
  getHabitacionesDisponibles,
  getPaquetesDisponibles,
};
