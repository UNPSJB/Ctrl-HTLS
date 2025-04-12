const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const { Op } = require('sequelize');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const Hotel = require('../../models/hotel/Hotel');
const CustomError = require('../../utils/CustomError');
const Habitacion = require('../../models/hotel/Habitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const {
  verificarHabitacionesPaquetePromocional,
} = require('./habitacionServices');
const { verificarPorcentaje } = require('../../utils/helpers');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');

const crearPaquete = async (idHotel, paquete) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  await verificarPorcentaje(paquete.coeficiente_descuento);

  // Verificar si el paquete promocional ya existe
  const paquetePromocionalExistente = await PaquetePromocional.findOne({
    where: { nombre: paquete.nombre },
  });
  if (paquetePromocionalExistente) {
    throw new CustomError(
      'Ya existe un paquete promocional con el mismo nombre',
      409,
    );
  }

  // Verificar si las habitaciones ya estan asignadas a otro paquete en la misma fecha
  await verificarHabitacionesPaquetePromocional(
    paquete.habitaciones,
    paquete.fecha_inicio,
    paquete.fecha_fin,
  );

  // Calcular la capacidad máxima del paquete
  let capacidadMaxima = 0;
  for (const idHabitacion of paquete.habitaciones) {
    const habitacion = await Habitacion.findByPk(idHabitacion, {
      include: [
        {
          model: TipoHabitacion,
          as: 'tipoHabitacion',
          attributes: ['capacidad'],
        },
      ],
    });
    if (habitacion && habitacion.tipoHabitacion) {
      capacidadMaxima += habitacion.tipoHabitacion.capacidad;
    }
  }

  // Crear el paquete promocional
  const nuevoPaquetePromocional = await PaquetePromocional.create({
    ...paquete,
    hotelId: idHotel,
    capacidad_maxima: capacidadMaxima, // Agregar la capacidad máxima calculada
  });
  return nuevoPaquetePromocional;
};

//IMPLEMENTAR
const modificarPaquete = async (idPaquete, paquete) => {};

//IMPLEMENTAR
const eliminarPaquete = async (idPaquete) => {};

const asignarHabitacionAPaquete = async (paqueteCreado, paquete) => {
  for (const habitacion of paquete.habitaciones) {
    await PaquetePromocionalHabitacion.create({
      habitacionId: habitacion,
      paquetePromocionalId: paqueteCreado.id,
      fechaInicio: paqueteCreado.fecha_inicio,
      fechaFin: paqueteCreado.fecha_fin,
    });
  }

  return getPaqueteCompleto(paqueteCreado.id);
};

const getPaqueteCompleto = async (idPaquete) => {
  const paquete = await PaquetePromocional.findByPk(idPaquete, {
    include: [
      {
        model: Habitacion,
        as: 'habitaciones',
        through: {
          model: PaquetePromocionalHabitacion,
          attributes: ['fechaInicio', 'fechaFin'],
        },
      },
    ],
  });

  if (!paquete) {
    throw new CustomError('El paquete promocional no existe', 404); // Not Found
  }

  return paquete;
};

const obtenerPaquetesTuristicos = async (idHotel, fechaInicio, fechaFin) => {
  // Obtener los paquetes promocionales del hotel que coincidan con las fechas
  const paquetes = await PaquetePromocional.findAll({
    where: {
      hotelId: idHotel,
      [Op.and]: [
        {
          fecha_inicio: {
            [Op.lte]: fechaFin, // El paquete debe comenzar antes o durante la fecha de fin
          },
        },
        {
          fecha_fin: {
            [Op.gte]: fechaInicio, // El paquete debe terminar después o durante la fecha de inicio
          },
        },
      ],
    },
    include: [
      {
        model: Habitacion,
        as: 'habitaciones',
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
      },
    ],
  });

  // Filtrar los paquetes que no están alquilados en el rango de fechas
  const paquetesDisponibles = [];
  for (const paquete of paquetes) {
    // Verificar si el paquete está alquilado
    const alquileres = await AlquilerPaquetePromocional.findAll({
      where: {
        paquetePromocionalId: paquete.id,
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
      continue; // Si el paquete está alquilado, lo excluimos
    }

    // Calcular la cantidad de noches
    const fechaInicioPaquete = new Date(paquete.fecha_inicio);
    const fechaFinPaquete = new Date(paquete.fecha_fin);
    const cantidadNoches = Math.ceil(
      (fechaFinPaquete - fechaInicioPaquete) / (1000 * 60 * 60 * 24),
    );

    // Estructurar las habitaciones asignadas al paquete
    const habitaciones = paquete.habitaciones.map((habitacion) => ({
      nombre: habitacion.tipoHabitacion.nombre,
      capacidad: habitacion.tipoHabitacion.capacidad,
      precio:
        habitacion.tipoHabitacion.hotelTipoHabitacion &&
        habitacion.tipoHabitacion.hotelTipoHabitacion[0] &&
        habitacion.tipoHabitacion.hotelTipoHabitacion[0].precio,
    }));

    paquetesDisponibles.push({
      id: paquete.id,
      nombre: paquete.nombre,
      noches: cantidadNoches,
      descuento: paquete.coeficiente_descuento,
      capacidad_maxima: paquete.capacidad_maxima,
      habitaciones: habitaciones,
    });
  }

  return paquetesDisponibles;
};

const guardarPaquetes = async (
  alquilerId,
  paquetes,
  fechaInicio,
  fechaFin,
  transaction,
) => {
  if (!paquetes || paquetes.length === 0) return;

  const paquetesData = paquetes.map((paqueteId) => ({
    alquilerId,
    paquetePromocionalId: paqueteId,
    fechaInicio,
    fechaFin,
  }));

  await AlquilerPaquetePromocional.bulkCreate(paquetesData, { transaction });
};

module.exports = {
  crearPaquete,
  asignarHabitacionAPaquete,
  obtenerPaquetesTuristicos,
  guardarPaquetes,
};
