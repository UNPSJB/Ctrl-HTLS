const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const CustomError = require('../../utils/CustomError');
const Hotel = require('../../models/hotel/Hotel');
const Habitacion = require('../../models/hotel/Habitacion');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const tipoHabitacionServices = require('./tipoHabitacionServices');
const {
  verificarDisponibilidadHabitaciones,
  verificarHabitacionesPaquetePromocional,
} = require('../ventas/verificarDisponibilidad');

const crearHabitaciones = async (idHotel, habitaciones) => {
  const transaction = await sequelize.transaction(); // Iniciar una transacción

  try {
    // Verificar si el hotel existe
    const hotel = await Hotel.findByPk(idHotel, { transaction });
    if (!hotel) {
      throw new CustomError('El hotel no existe', 404); // Not Found
    }

    // Verificar si los tipos de habitación son válidos y están relacionados con el hotel
    const idsTipoHabitacion = habitaciones.map((h) => h.idTipoHabitacion);
    const tiposPorHotel =
      await tipoHabitacionServices.obtenerTiposDeHabitacionDeHotel(idHotel);
    console.log(tiposPorHotel);

    // const tiposRelacionados = await HotelTipoHabitacion.findAll({
    //   where: {
    //     hotelId: idHotel,
    //     tipoHabitacionId: { [Op.in]: idsTipoHabitacion },
    //   },
    //   transaction,
    // });

    // const tiposRelacionadosIds = tiposRelacionados.map(
    //   (t) => t.tipoHabitacionId,
    // );
    // const tiposInvalidos = idsTipoHabitacion.filter(
    //   (id) => !tiposRelacionadosIds.includes(id),
    // );

    // if (tiposInvalidos.length > 0) {
    //   throw new CustomError(
    //     `Los siguientes tipos de habitación no están relacionados con el hotel: ${tiposInvalidos.join(
    //       ', ',
    //     )}`,
    //     400, // Bad Request
    //   );
    // }

    // // Verificar si hay números de habitación duplicados en el mismo hotel
    // const numerosHabitacion = habitaciones.map((h) => h.numero);
    // const habitacionesExistentes = await Habitacion.findAll({
    //   where: {
    //     hotelId: idHotel,
    //     numero: { [Op.in]: numerosHabitacion },
    //   },
    //   transaction,
    // });

    // if (habitacionesExistentes.length > 0) {
    //   const numerosDuplicados = habitacionesExistentes.map((h) => h.numero);
    //   throw new CustomError(
    //     `Los siguientes números de habitación ya existen en este hotel: ${numerosDuplicados.join(
    //       ', ',
    //     )}`,
    //     409, // Conflict
    //   );
    // }

    // // Crear las habitaciones
    // const habitacionesCreadas = await Promise.all(
    //   habitaciones.map((habitacion) =>
    //     Habitacion.create(
    //       {
    //         hotelId: idHotel,
    //         numero: habitacion.numero,
    //         piso: habitacion.piso,
    //         tipoHabitacionId: habitacion.idTipoHabitacion,
    //       },
    //       { transaction },
    //     ),
    //   ),
    // );

    // // Confirmar la transacción
    // await transaction.commit();

    // return habitacionesCreadas;
  } catch (error) {
    // Revertir la transacción si algo falla
    await transaction.rollback();
    throw new CustomError(`Error al crear habitaciones: ${error.message}`, 500);
  }
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
  const habitacionExistente = await getHabitacion(idHabitacion);

  if (!habitacionExistente) {
    throw new CustomError('La habitación no existe', 404); // Not Found
  }

  //Verificar que no exista una habitación con el mismo número en el mismo hotel
  const habitacionExistenteNum = await getHabitacionPorNumeroYHotel(
    idHotel,
    habitacion.numero,
  );

  if (habitacionExistenteNum) {
    if (habitacionExistenteNum.id !== idHabitacion) {
      throw new CustomError(
        `La habitación número ${habitacion.numero} ya existe en este hotel.`,
        409,
      ); // Conflict
    }
  }

  // Verificar si el tipo de habitación existe
  await verificarTipoHabitacion(habitacion.idTipoHabitacion, idHotel);

  // Verificar que no se excedan los límites de habitaciones y pisos
  await verificarLimitesHabitaciones(idHotel, [habitacion]);

  const fechaActual = new Date(); // Fecha actual
  const fechaFin = new Date('9999-12-31'); // Fecha futura amplia

  // Verificar si la habitación está alquilada actualmente o en el futuro
  const habitacionesAlquiladas = await verificarDisponibilidadHabitaciones(
    [idHabitacion], // Pasar el ID como un arreglo
    fechaActual,
    fechaFin,
  );

  if (habitacionesAlquiladas.length > 0) {
    throw new CustomError(
      'La habitación está alquilada actualmente o en el futuro y no puede ser modificada.',
      400,
    ); // Bad Request
  }

  // Verificar si la habitación está asociada a uno o más paquetes promocionales
  const habitacionesEnPaquete = await verificarHabitacionesPaquetePromocional(
    [idHabitacion], // Pasar el ID como un arreglo
    fechaActual,
    fechaFin,
  );

  if (habitacionesEnPaquete.length > 0) {
    throw new CustomError(
      'La habitación está asignada a un paquete promocional actualmente o en el futuro y no puede ser modificada.',
      400,
    ); // Bad Request
  }

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
  const habitacion = await getHabitacion(idHabitacion);

  if (!habitacion) {
    throw new CustomError('La habitación no existe', 404); // Not Found
  }

  const fechaActual = new Date(); // Fecha actual
  const fechaFin = new Date('9999-12-31'); // Fecha futura amplia

  // Verificar si la habitación está alquilada actualmente o en el futuro
  const habitacionesAlquiladas = await verificarDisponibilidadHabitaciones(
    [idHabitacion], // Pasar el ID como un arreglo
    fechaActual,
    fechaFin,
  );

  if (habitacionesAlquiladas.length > 0) {
    throw new CustomError(
      'La habitación está alquilada actualmente o en el futuro y no puede ser eliminada.',
      400,
    ); // Bad Request
  }

  // Verificar si la habitación está asociada a uno o más paquetes promocionales
  const habitacionesEnPaquete = await verificarHabitacionesPaquetePromocional(
    [idHabitacion], // Pasar el ID como un arreglo
    fechaActual,
    fechaFin,
  );

  if (habitacionesEnPaquete.length > 0) {
    throw new CustomError(
      'La habitación está asignada a un paquete promocional actualmente o en el futuro y no puede ser eliminada.',
      400,
    ); // Bad Request
  }

  //Verificar que no exista una habitación con el mismo número en el mismo hotel

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

// Verificar si la habitación está alquilada en las fechas dadas
const verificarAlquilada = async (habitaciones, fechaInicio, fechaFin) => {
  console.log('habitaciones: ', habitaciones);

  // Obtener todas las habitaciones alquiladas en el rango de fechas
  const alquileres = await AlquilerHabitacion.findAll({
    where: {
      habitacionId: { [Op.in]: habitaciones },
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
    attributes: ['habitacionId'], // Solo necesitamos los IDs de las habitaciones alquiladas
  });

  // Extraer los IDs de las habitaciones alquiladas
  const habitacionesAlquiladas = alquileres.map(
    (alquiler) => alquiler.habitacionId,
  );

  // Filtrar las habitaciones que no están alquiladas
  const habitacionesDisponibles = habitaciones.filter(
    (idHabitacion) => !habitacionesAlquiladas.includes(idHabitacion),
  );

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

const obtenerHabitacionesDisponiblesPorTipo = async (
  idHotel,
  fechaInicio,
  fechaFin,
  pasajeros,
) => {
  // Obtener todas las habitaciones del hotel con su tipo de habitación
  const habitaciones = await Habitacion.findAll({
    where: { hotelId: idHotel },
    include: [
      {
        model: TipoHabitacion,
        as: 'tipoHabitacion',
        attributes: ['nombre', 'capacidad'],
        include: [
          {
            model: HotelTipoHabitacion,
            as: 'hotelTipoHabitacion',
            where: { hotelId: idHotel },
            attributes: ['precio'],
          },
        ],
      },
    ],
  });

  // Extraer los IDs de las habitaciones
  const idsHabitaciones = habitaciones.map((habitacion) => habitacion.id);

  // Verificar cuáles habitaciones no están alquiladas
  const habitacionesNoAlquiladas = await verificarAlquilada(
    idsHabitaciones,
    fechaInicio,
    fechaFin,
  );

  // Filtrar las habitaciones que no están alquiladas y cuya capacidad sea menor o igual a "pasajeros"
  const habitacionesDisponibles = habitaciones.filter(
    (habitacion) =>
      habitacionesNoAlquiladas.includes(habitacion.id) &&
      habitacion.tipoHabitacion.capacidad <= pasajeros,
  );

  // Agrupar habitaciones por tipo
  const habitacionesPorTipo = habitacionesDisponibles.reduce(
    (resultado, habitacion) => {
      const tipo = habitacion.tipoHabitacion.nombre;

      // Acceder al precio desde el arreglo hotelTipoHabitacion
      const precio =
        habitacion.tipoHabitacion.hotelTipoHabitacion &&
        habitacion.tipoHabitacion.hotelTipoHabitacion[0] &&
        habitacion.tipoHabitacion.hotelTipoHabitacion[0].precio;

      if (!resultado[tipo]) {
        resultado[tipo] = {
          habitaciones: [],
          precio: precio || 0, // Asegurarse de que el precio esté presente
          capacidad: habitacion.tipoHabitacion.capacidad,
        };
      }
      resultado[tipo].habitaciones.push({
        id: habitacion.id,
        numero: habitacion.numero,
        piso: habitacion.piso,
      });
      return resultado;
    },
    {},
  );

  return Object.entries(habitacionesPorTipo).map(([tipo, datos]) => ({
    [tipo]: datos.habitaciones,
    precio: datos.precio,
    capacidad: datos.capacidad,
  }));
};

const guardarHabitaciones = async (
  alquilerId,
  habitaciones,
  fechaInicio,
  fechaFin,
  transaction,
) => {
  if (!habitaciones || habitaciones.length === 0) return;

  const habitacionesData = habitaciones.map((habitacionId) => ({
    alquilerId,
    habitacionId,
    fechaInicio,
    fechaFin,
  }));

  await AlquilerHabitacion.bulkCreate(habitacionesData, { transaction });
};

const getHabitacion = (idHabitacion) => {
  return Habitacion.findOne({
    where: { id: idHabitacion },
    include: [
      {
        model: TipoHabitacion,
        as: 'tipoHabitacion',
        attributes: ['nombre', 'capacidad'],
      },
    ],
  });
};

const getHabitacionPorNumeroYHotel = (idHotel, numero) => {
  return Habitacion.findOne({
    where: {
      hotelId: idHotel,
      numero: numero,
    },
  });
};

module.exports = {
  crearHabitaciones,
  obtenerHabitaciones,
  modificarHabitacion,
  eliminarHabitacion,
  obtenerHabitacionesDisponiblesPorTipo,
  //verificarAlquilada,
  verificarHabitacionesHotel,
  verificarHabitacionEnPaquete,
  obtenerHabitacionesPorCapacidad,
  guardarHabitaciones,
};
