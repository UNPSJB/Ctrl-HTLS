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

const obtenerDisponibilidad = async (consultaAlquiler) => {
  const { ubicacion, fechaInicio, fechaFin, pasajeros } = consultaAlquiler;

  // Verificar la ciudad
  await verificarCiudad(ubicacion);

  // Convertir strings a objetos Date
  const desde = convertirFechas(fechaInicio);
  const hasta = convertirFechas(fechaFin);

  if (pasajeros < 0) {
    throw new CustomError('La cantidad de pasajeros debe ser mayor a 0', 400); // Bad Request
  }

  return await hotelServices.getDisponibilidadPorHotel(
    ubicacion,
    desde,
    hasta,
    pasajeros,
  );
};

module.exports = { obtenerDisponibilidad };
