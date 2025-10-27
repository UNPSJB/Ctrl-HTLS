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

const crearReserva = async (reservas) => {
  const transaction = await sequelize.transaction();
  //const alquileresCreados = [];
  try {
    for (const reserva of reservas) {
      const alquileres = reserva.alquiler;
      for (const alquiler of alquileres) {
        const {
          fechaInicio,
          fechaFin,
          montoTotal,
          pasajeros,
          habitaciones,
          paquetes,
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
            paquetes,
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
          reserva.clienteId,
          {
            fechaInicio,
            fechaFin,
            pasajeros,
            importe_total: montoTotal,
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

        if (paquetes && paquetes.length > 0) {
          await paquetePromocionalServices.guardarPaquetes(
            nuevoAlquiler.id,
            paquetes,
            fechaInicio,
            fechaFin,
            transaction, // Pasar la transacción
          );
        }

        // // Agregar información del alquiler creado al arreglo
        // alquileresCreados.push({
        //   alquilerId: nuevoAlquiler.id,
        //   hotelId: reserva.hotelId,
        //   fechaInicio,
        //   fechaFin,
        //   montoTotal,
        //   habitaciones: habitaciones || [],
        //   paquetesPromocionales: paquetes || [],
        // });
      }
    }
    await transaction.commit();
    return reservas;
  } catch (error) {
    throw new CustomError(
      `Error al crear la reserva: ${error.message}`,
      error.statusCode || 500,
    ); // Internal Server Error
  }
};

const actualizarReserva = async (reservas) => {
  const transaction = await sequelize.transaction();

  try {
    for (const alquiler of reservas.alquileres) {
      const {
        alquilerId,
        fechaInicio,
        fechaFin,
        pasajeros,
        montoTotal,
        habitaciones, // Array de IDs: [1, 3, 5, 7]
        paquetes, // Array de IDs: [2, 4]
      } = alquiler;

      // 1. Actualizar los datos básicos del alquiler
      await Alquiler.update(
        {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          pasajeros: pasajeros,
          importe_total: montoTotal,
        },
        {
          where: { id: alquilerId },
          transaction,
        },
      );

      // ========== SINCRONIZAR HABITACIONES ==========
      if (habitaciones && Array.isArray(habitaciones)) {
        // Paso 1: Obtener qué habitaciones tiene actualmente el alquiler en la BD
        const habitacionesActuales = await AlquilerHabitacion.findAll({
          where: { alquilerId },
          attributes: ['habitacionId'],
          transaction,
        });

        const habitacionesActualesIds = habitacionesActuales.map(
          (h) => h.habitacionId,
        );

        // Paso 2: Identificar las habitaciones NUEVAS que hay que AGREGAR
        const habitacionesAgregar = habitaciones.filter(
          (id) => !habitacionesActualesIds.includes(id),
        );

        // Paso 3: Identificar las habitaciones VIEJAS que hay que ELIMINAR
        // Habitaciones a eliminar = las que están en la BD pero NO en el front
        // habitacionesEliminar = [2, 4]
        const habitacionesEliminar = habitacionesActualesIds.filter(
          (id) => !habitaciones.includes(id),
        );

        // Paso 4: AGREGAR las habitaciones nuevas
        if (habitacionesAgregar.length > 0) {
          await AlquilerHabitacion.bulkCreate(
            habitacionesAgregar.map((habitacionId) => ({
              alquilerId,
              habitacionId,
              fechaInicio,
              fechaFin,
            })),
            { transaction },
          );
        }

        // Paso 5: ELIMINAR las habitaciones que ya no están
        if (habitacionesEliminar.length > 0) {
          await AlquilerHabitacion.destroy({
            where: {
              alquilerId,
              habitacionId: habitacionesEliminar,
            },
            transaction,
          });
        }
      }

      // ========== SINCRONIZAR PAQUETES (misma lógica) ==========
      if (paquetes && Array.isArray(paquetes)) {
        const paquetesActuales = await AlquilerPaquetePromocional.findAll({
          where: { alquilerId },
          attributes: ['paquetePromocionalId'],
          transaction,
        });

        const paquetesActualesIds = paquetesActuales.map(
          (p) => p.paquetePromocionalId,
        );

        // Identificar paquetes a agregar
        const paquetesAgregar = paquetes.filter(
          (id) => !paquetesActualesIds.includes(id),
        );

        // Identificar paquetes a eliminar
        const paquetesEliminar = paquetesActualesIds.filter(
          (id) => !paquetes.includes(id),
        );

        // Agregar nuevos paquetes
        if (paquetesAgregar.length > 0) {
          await AlquilerPaquetePromocional.bulkCreate(
            paquetesAgregar.map((paquetePromocionalId) => ({
              alquilerId,
              paquetePromocionalId,
              fechaInicio,
              fechaFin,
            })),
            { transaction },
          );
        }

        // Eliminar paquetes viejos
        if (paquetesEliminar.length > 0) {
          await AlquilerPaquetePromocional.destroy({
            where: {
              alquilerId,
              paquetePromocionalId: paquetesEliminar,
            },
            transaction,
          });
        }
      }
    }

    await transaction.commit();
    return reservas;
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar reserva:', error);
    throw new CustomError(
      `Error al actualizar la reserva: ${error.message}`,
      500,
    );
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
  actualizarReserva,
  cancelarReserva,
};
