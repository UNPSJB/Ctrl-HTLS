const CustomError = require('../../utils/CustomError');
const hotelServices = require('../hotel/hotelServices');
const {
  verificarCiudad,
  verificarFechas,
  convertirFechas,
} = require('../../utils/helpers');

const obtenerDisponibilidad = async (consultaAlquiler) => {
  const { ubicacion, fechaInicio, fechaFin, pasajeros } = consultaAlquiler;

  await verificarCiudad(ubicacion);
  await verificarFechas(fechaInicio, fechaFin);
  const desde = convertirFechas(fechaInicio);
  const hasta = convertirFechas(fechaFin);

  if (pasajeros < 0) {
    throw new CustomError('La cantidad de pasajeros debe ser mayor a 0', 400); // Bad Request
  }

  const habitacionesDisponibles =
    await hotelServices.getHabitacionesDisponibles(
      ubicacion,
      desde,
      hasta,
      pasajeros,
    );

  return habitacionesDisponibles;
};

module.exports = { obtenerDisponibilidad };
