const CustomError = require('../../utils/CustomError');
const hotelServices = require('../hotel/hotelServices');
const {
  verificarCiudad,
  verificarFechas,
  convertirFechas,
} = require('../../utils/helpers');
const { Op } = require('sequelize');

const Hotel = require('../../models/hotel/Hotel');

const Habitacion = require('../../models/hotel/Habitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const PaquetePromocional = require('../../models/hotel/PaquetePromocional');

const Alquiler = require('../../models/ventas/Alquiler');

// const obtenerDisponibilidad = async (consultaAlquiler) => {
//   const { ubicacion, fechaInicio, fechaFin, pasajeros } = consultaAlquiler;
//   let disponibilidad = [];
//   await verificarCiudad(ubicacion);
//   const desde = convertirFechas(fechaInicio);
//   const hasta = convertirFechas(fechaFin);
//   await verificarFechas(desde, hasta);

//   if (pasajeros < 0) {
//     throw new CustomError('La cantidad de pasajeros debe ser mayor a 0', 400); // Bad Request
//   }

// const habitacionesDisponibles =
//   await hotelServices.getHabitacionesDisponibles(
//     ubicacion,
//     desde,
//     hasta,
//     pasajeros,
//   );

// const paquetesDisponibles = await hotelServices.getPaquetesDisponibles(
//   ubicacion,
//   desde,
//   hasta,
//   pasajeros,
// );

//disponibilidad = [...habitacionesDisponibles, ...paquetesDisponibles];

//return disponibilidad;
//   return paquetesDisponibles;
// };

const obtenerDisponibilidad = async (consultaAlquiler) => {
  const { ubicacion, fechaInicio, fechaFin, pasajeros } = consultaAlquiler;

  // Convertir strings a objetos Date
  const fechaInicioDate = new Date(fechaInicio);
  const fechaFinDate = new Date(fechaFin);

  const hoteles = await Hotel.findAll({
    where: { ciudadId: ubicacion },
    include: [
      {
        model: Habitacion,
        as: 'habitaciones',
        include: [
          {
            model: TipoHabitacion,
            as: 'tipoHabitacion',
            where: { capacidad: { [Op.gte]: pasajeros } },
          },
          {
            model: Alquiler,
            as: 'alquileres',
            required: false,
            where: {
              [Op.or]: [
                { fecha_fin: { [Op.lt]: fechaInicioDate } }, // Usamos Date
                { fecha_inicio: { [Op.gt]: fechaFinDate } }, // Usamos Date
              ],
            },
          },
        ],
      },
      {
        model: PaquetePromocional,
        as: 'paquetesPromocionales',
        required: false,
        where: {
          fecha_inicio: { [Op.lte]: fechaInicioDate },
          fecha_fin: { [Op.gte]: fechaFinDate },
        },
        include: [
          {
            model: Habitacion,
            as: 'habitaciones',
            include: [
              {
                model: TipoHabitacion,
                as: 'tipoHabitacion',
                where: { capacidad: { [Op.gte]: pasajeros } },
              },
              {
                model: Alquiler,
                as: 'alquileres',
                required: false,
                where: {
                  [Op.or]: [
                    { fecha_fin: { [Op.lt]: fechaInicioDate } },
                    { fecha_inicio: { [Op.gt]: fechaFinDate } },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  });

  return hoteles;
};

module.exports = { obtenerDisponibilidad };
