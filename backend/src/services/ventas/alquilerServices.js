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

  // Obtener las habitaciones disponibles
  const habitacionesDisponibles =
    await hotelServices.getHabitacionesDisponibles(
      ubicacion,
      desde,
      hasta,
      pasajeros,
    );

  // Obtener los paquetes promocionales disponibles
  const paquetesDisponibles = await hotelServices.getPaquetesDisponibles(
    ubicacion,
    desde,
    hasta,
    pasajeros,
  );

  // Organizar la disponibilidad por hotel
  const disponibilidadPorHotel = {};

  habitacionesDisponibles.forEach((habitacion) => {
    const hotelId = habitacion.hotelId;
    if (!disponibilidadPorHotel[hotelId]) {
      disponibilidadPorHotel[hotelId] = {
        hotelId,
        habitaciones: [],
        paquetes: [],
      };
    }
    disponibilidadPorHotel[hotelId].habitaciones.push(habitacion);
  });

  paquetesDisponibles.forEach((paquete) => {
    const hotelId = paquete.hotelId;
    if (!disponibilidadPorHotel[hotelId]) {
      disponibilidadPorHotel[hotelId] = {
        hotelId,
        habitaciones: [],
        paquetes: [],
      };
    }
    disponibilidadPorHotel[hotelId].paquetes.push(paquete);
  });

  return Object.values(disponibilidadPorHotel);
};

module.exports = { obtenerDisponibilidad };
