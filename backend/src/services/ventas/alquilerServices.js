const CustomError = require('../../utils/CustomError');
const hotelServices = require('../hotel/hotelServices');
const {
  verificarCiudad,
  verificarFechas,
  convertirFechas,
} = require('../../utils/helpers');

const obtenerDisponibilidad = async (consultaAlquiler) => {
  const { ubicacion, fechaInicio, fechaFin, pasajeros } = consultaAlquiler;
  let disponibilidad = [];
  await verificarCiudad(ubicacion);
  const desde = convertirFechas(fechaInicio);
  const hasta = convertirFechas(fechaFin);
  await verificarFechas(desde, hasta);

  if (pasajeros < 0) {
    throw new CustomError('La cantidad de pasajeros debe ser mayor a 0', 400); // Bad Request
  }

  // const habitacionesDisponibles =
  //   await hotelServices.getHabitacionesDisponibles(
  //     ubicacion,
  //     desde,
  //     hasta,
  //     pasajeros,
  //   );

  const paquetesDisponibles = await hotelServices.getPaquetesDisponibles(
    ubicacion,
    desde,
    hasta,
    pasajeros,
  );

  //disponibilidad = [...habitacionesDisponibles, ...paquetesDisponibles];

  //return disponibilidad;
  return paquetesDisponibles;
};

module.exports = { obtenerDisponibilidad };
