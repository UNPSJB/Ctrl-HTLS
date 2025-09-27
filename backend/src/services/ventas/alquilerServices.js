const sequelize = require('../../config/database');
const CustomError = require('../../utils/CustomError');
const hotelServices = require('../hotel/hotelServices');
const {
  verificarCiudad,
  verificarFechas,
  convertirFechas,
} = require('../../utils/helpers');
const verificarDisponibilidad = require('./verificarDisponibilidad');

const habitacionServices = require('../hotel/habitacionServices');
const paquetePromocionalServices = require('../hotel/paquetePromocionalServices');
const personaServices = require('../core/personaServices');

const Alquiler = require('../../models/ventas/Alquiler');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');

const obtenerDisponibilidad = async (consultaAlquiler) => {
  const {
    ubicacion,
    fechaInicio,
    fechaFin,
    pasajeros,
    nombreHotel,
    vendedorId,
  } = consultaAlquiler;

  // Verificar la ciudad
  await verificarCiudad(ubicacion);

  const desde = convertirFechas(fechaInicio);
  const hasta = convertirFechas(fechaFin);

  // Verificar las fechas
  verificarFechas(desde, hasta);

  if (pasajeros < 0) {
    throw new CustomError('La cantidad de pasajeros debe ser mayor a 0', 400); // Bad Request
  }

  const nombreHotelString = nombreHotel.toString().toLowerCase();

  return await hotelServices.getDisponibilidadPorHotel(
    ubicacion,
    fechaInicio,
    fechaFin,
    pasajeros,
    nombreHotelString,
    vendedorId,
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
          await verificarDisponibilidad.verificarDisponibilidadHabitaciones(
            habitaciones,
            fechaInicio,
            fechaFin,
          );
        if (habitacionesDisponibles.length > 0) {
          throw new CustomError(
            'Algunas habitaciones no están disponibles en las fechas seleccionadas',
            400,
          );
        }

        const paquetesDisponibles =
          await verificarDisponibilidad.verificarDisponibilidadPaquetes(
            paquetesPromocionales,
            fechaInicio,
            fechaFin,
          );
        if (paquetesDisponibles.length > 0) {
          throw new CustomError(
            'Algunos paquetes no están disponibles en las fechas seleccionadas',
            400,
          );
        }
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
    throw new CustomError(
      `Error al crear la reserva: ${error.message}`,
      error.statusCode || 500,
    ); // Internal Server Error
  }
};

const cancelarReserva = async (alquilerIds) => {
  // Iniciar una transacción
  const transaction = await sequelize.transaction();

  try {
    // Verificar que el arreglo de IDs no esté vacío
    if (!alquilerIds || alquilerIds.length === 0) {
      throw new CustomError(
        'No se proporcionaron IDs de alquiler para cancelar',
        400,
      );
    }

    // Eliminar las habitaciones asociadas a los alquileres
    await AlquilerHabitacion.destroy({
      where: { alquilerId: alquilerIds },
      transaction,
    });

    // Eliminar los paquetes promocionales asociados a los alquileres
    await AlquilerPaquetePromocional.destroy({
      where: { alquilerId: alquilerIds },
      transaction,
    });

    // Eliminar los alquileres
    await Alquiler.destroy({
      where: { id: alquilerIds },
      transaction,
    });

    // Confirmar la transacción
    await transaction.commit();
  } catch (error) {
    // Revertir la transacción si algo falla
    await transaction.rollback();
    throw new CustomError(
      `Error al cancelar las reservas: ${error.message}`,
      500,
    );
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

module.exports = {
  obtenerDisponibilidad,
  crearReserva,
  guardarAlquiler,
  cancelarReserva,
};
