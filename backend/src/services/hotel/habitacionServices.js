const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const Hotel = require('../../models/hotel/Hotel');
const Habitacion = require('../../models/hotel/Habitacion');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');

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

const modificarHabitacion = async (idHotel, idHabitacion, habitacion) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  // Verificar si la habitación existe
  const habitacionExistente = await Habitacion.findOne({
    where: {
      hotelId: idHotel,
      id: idHabitacion,
    },
  });
  if (!habitacionExistente) {
    throw new CustomError('La habitación no existe', 404); // Not Found
  }

  //Verificar que no exista una habitación con el mismo número en el mismo hotel
  const habitacionExistenteNum = await Habitacion.findOne({
    where: {
      hotelId: idHotel,
      numero: habitacion.numero,
    },
  });

  if (
    habitacionExistenteNum &&
    habitacionExistenteNum.id.toInt !== idHabitacion.toInt
  ) {
    throw new CustomError(
      `La habitación número ${habitacion.numero} ya existe en este hotel.`,
      409,
    ); // Conflict
  }

  // Verificar si el tipo de habitación existe
  await verificarTipoHabitacion(habitacion.idTipoHabitacion, idHotel);

  // Verificar que no se excedan los límites de habitaciones y pisos
  await verificarLimitesHabitaciones(idHotel, [habitacion]);

  // Verificar si la habitación está alquilada actualmente o en el futuro
  await verificarOcupada(idHabitacion);

  // Verificar si la habitación está asociada a uno o más paquetes promocionales
  await verificarPaquetePromocional(idHabitacion);

  habitacionExistente.numero = habitacion.numero;
  habitacionExistente.piso = habitacion.piso;
  habitacionExistente.tipoHabitacionId = habitacion.idTipoHabitacion;

  await habitacionExistente.save();
  return habitacionExistente;
};

// Eliminar una habitación
const eliminarHabitacion = async (idHotel, idHabitacion) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  // Verificar si la habitación existe
  const habitacion = await Habitacion.findOne({
    where: {
      hotelId: idHotel,
      id: idHabitacion,
    },
  });
  if (!habitacion) {
    throw new CustomError('La habitación no existe', 404); // Not Found
  }

  // Verificar si la habitación está alquilada actualmente o en el futuro
  await verificarOcupada(idHabitacion);

  // Verificar si la habitación está asociada a uno o más paquetes promocionales
  await verificarPaquetePromocional(idHabitacion);

  await habitacion.destroy();
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

const verificarAlquilada = async (habitaciones, fechaInicio, fechaFin) => {
  // Obtener las habitaciones que no están alquiladas en el rango de fechas
  const habitacionesDisponibles = [];

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

    // Si no hay alquileres en el rango de fechas, agregar la habitación a la lista de disponibles
    if (alquileres.length === 0) {
      habitacionesDisponibles.push(idHabitacion);
    }
  }

  return habitacionesDisponibles;
};

const verificarHabitacionesHotel = async (idHotel, habitaciones) => {
  for (const idHabitacion of habitaciones) {
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
  }
};

// Verificar si la habitación está asociada a uno o más paquetes promocionales
const verificarHabitacionEnPaquete = async (habitaciones, inicio, fin) => {
  const habitacionesDisponibles = [];

  for (const idHabitacion of habitaciones) {
    const paquetes = await PaquetePromocionalHabitacion.findAll({
      where: {
        habitacionId: idHabitacion,
        [Op.or]: [
          {
            fechaInicio: {
              [Op.between]: [inicio, fin],
            },
          },
          {
            fechaFin: {
              [Op.between]: [inicio, fin],
            },
          },
          {
            [Op.and]: [
              {
                fechaInicio: {
                  [Op.lte]: inicio,
                },
              },
              {
                fechaFin: {
                  [Op.gte]: fin,
                },
              },
            ],
          },
        ],
      },
    });

    if (paquetes.length === 0) {
      habitacionesDisponibles.push(idHabitacion);
    }
  }
  return habitacionesDisponibles;
};

const obtenerHabitacionesPorCapacidad = async (idHotel, pasajeros) => {
  // Obtener las habitaciones del hotel con su tipo de habitación
  //let habitacionesFiltradas = [];
  const habitaciones = await Habitacion.findAll({
    where: { hotelId: idHotel },
    include: [
      {
        model: TipoHabitacion,
        as: 'tipoHabitacion',
        attributes: ['nombre', 'capacidad'],
      },
    ],
  });

  if (habitaciones.length === 0) {
    return []; // Si no hay habitaciones, devolver un array vacío
  }

  // Calcular la capacidad máxima de las habitaciones
  const capacidadMaxima = Math.max(
    ...habitaciones.map((h) => h.tipoHabitacion.capacidad),
  );

  // Si la cantidad de pasajeros supera la capacidad máxima, devolver todas las habitaciones
  if (pasajeros > capacidadMaxima) {
    return habitaciones;
  }

  // Filtrar habitaciones que cumplen con la capacidad requerida
  const habitacionesFiltradas = habitaciones.filter(
    (h) => h.tipoHabitacion.capacidad <= pasajeros,
  );

  return habitacionesFiltradas;
};

module.exports = {
  agregarHabitaciones,
  obtenerHabitaciones,
  modificarHabitacion,
  eliminarHabitacion,
  verificarAlquilada,
  verificarHabitacionesHotel,
  verificarHabitacionEnPaquete,
  obtenerHabitacionesPorCapacidad,
};
