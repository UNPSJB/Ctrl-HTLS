const sequelize = require('../../config/database');
const CustomError = require('../../utils/CustomError');
const hotelServices = require('../hotel/hotelServices');
const {
  verificarCiudad,
  verificarFechas,
  convertirFechas,
} = require('../../utils/helpers');
const {
  verificarDisponibilidadHabitaciones,
  verificarDisponibilidadPaquetes,
} = require('./verificarDisponibilidad');

const habitacionServices = require('../hotel/habitacionServices');
const paquetePromocionalServices = require('../hotel/paquetePromocionalServices');
const personaServices = require('../core/personaServices');

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

const crearReserva = async (reserva) => {
  const { hoteles, numeroDocumento, puntos } = reserva;

  // Iniciar una transacción
  const transaction = await sequelize.transaction();
  const alquileresCreados = []; // Arreglo para almacenar los alquileres creados

  try {
    const cliente =
      await personaServices.obtenerClientePorDocumento(numeroDocumento);

    for (const hotel of hoteles) {
      const { alquileres } = hotel;

      for (const alquiler of alquileres) {
        const {
          habitaciones,
          paquetesPromocionales,
          fechaInicio,
          fechaFin,
          pasajeros,
          importe_total,
        } = alquiler;

        // Verificar disponibilidad
        const habitacionesDisponibles =
          await verificarDisponibilidadHabitaciones(
            habitaciones,
            fechaInicio,
            fechaFin,
          );
        if (!habitacionesDisponibles) {
          throw new CustomError(
            'Algunas habitaciones no están disponibles en las fechas seleccionadas',
            400,
          );
        }
        await verificarDisponibilidadPaquetes(
          paquetesPromocionales,
          fechaInicio,
          fechaFin,
        );

        // Guardar alquiler
        const nuevoAlquiler = await guardarAlquiler(
          cliente.id,
          {
            fechaInicio,
            fechaFin,
            pasajeros,
            importe_total,
          },
          transaction, // Pasar la transacción
        );
        // Guardar habitaciones y paquetes
        if (habitaciones && habitaciones.length > 0) {
          await habitacionServices.guardarHabitaciones(
            nuevoAlquiler.id,
            habitaciones,
            fechaInicio,
            fechaFin,
            transaction, // Pasar la transacción
          );
        }

        if (paquetesPromocionales && paquetesPromocionales.length > 0) {
          await paquetePromocionalServices.guardarPaquetes(
            nuevoAlquiler.id,
            paquetesPromocionales,
            fechaInicio,
            fechaFin,
            transaction, // Pasar la transacción
          );
        }

        // Agregar información del alquiler creado al arreglo
        alquileresCreados.push({
          alquilerId: nuevoAlquiler.id,
          hotelId: hotel.hotelId,
          fechaInicio,
          fechaFin,
          importe_total,
          habitaciones: habitaciones || [],
          paquetesPromocionales: paquetesPromocionales || [],
        });
      }
    }

    // Actualizar puntos del cliente
    await personaServices.actualizarPuntosCliente(
      cliente.id,
      puntos,
      transaction,
    );

    // Confirmar la transacción
    await transaction.commit();

    // Devolver los alquileres creados
    return alquileresCreados;
  } catch (error) {
    // Revertir la transacción si algo falla
    await transaction.rollback();
    throw new CustomError(`Error al crear la reserva: ${error.message}`, 500);
  }
};

const guardarAlquiler = async (clienteId, alquiler, transaction) => {
  const { fechaInicio, fechaFin, pasajeros, importe_total } = alquiler;

  return await Alquiler.create(
    {
      clienteId,
      fecha_inicio: new Date(fechaInicio),
      fecha_fin: new Date(fechaFin),
      pasajeros,
      importe_total,
    },
    { transaction }, // Pasar la transacción
  );
};

module.exports = { obtenerDisponibilidad, crearReserva, guardarAlquiler };
