const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const Hotel = require('../../models/hotel/Hotel');
const CustomError = require('../../utils/CustomError');
const Habitacion = require('../../models/hotel/Habitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const { verificarPorcentaje } = require('../../utils/helpers');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const verificarDisponibilidad = require('../ventas/verificarDisponibilidad');

const crearPaquete = async (idHotel, paquete) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  await verificarPorcentaje(paquete.coeficiente_descuento);

  // Verificar si el paquete promocional ya existe
  const paquetePromocionalExistente = await PaquetePromocional.findOne({
    where: {
      nombre: paquete.nombre,
      hotelId: idHotel,
    },
  });
  if (paquetePromocionalExistente) {
    throw new CustomError(
      'Ya existe un paquete promocional con el mismo nombre en este hotel',
      409,
    );
  }

  // Verificar si las habitaciones ya estan asignadas a otro paquete en la misma fecha
  const resp =
    await verificarDisponibilidad.verificarHabitacionesPaquetePromocional(
      paquete.habitaciones,
      paquete.fecha_inicio,
      paquete.fecha_fin,
    );
  if (resp.length > 0) {
    throw new CustomError(
      'Las habitaciones ya están asignadas a otro paquete en la misma fecha',
      409,
    );
  }
  // Verificar si las habitaciones ya están alquiladas en el rango de fechas especificado
  const resp2 =
    await verificarDisponibilidad.verificarDisponibilidadHabitaciones(
      paquete.habitaciones,
      paquete.fecha_inicio,
      paquete.fecha_fin,
    );
  if (resp2.length > 0) {
    throw new CustomError(
      'Las habitaciones ya están alquiladas en el rango de fechas especificado',
      409,
    );
  }
  // Calcular la capacidad máxima del paquete
  const habitacionesConTipo = await Habitacion.findAll({
    where: { id: { [Op.in]: paquete.habitaciones } },
    include: [
      {
        model: TipoHabitacion,
        as: 'tipoHabitacion',
        attributes: ['capacidad'],
      },
    ],
  });
  const capacidadMaxima = habitacionesConTipo.reduce(
    (sum, h) => sum + (h.tipoHabitacion ? h.tipoHabitacion.capacidad : 0),
    0,
  );

  // Crear el paquete promocional
  const nuevoPaquetePromocional = await PaquetePromocional.create({
    ...paquete,
    hotelId: idHotel,
    capacidad_maxima: capacidadMaxima, // Agregar la capacidad máxima calculada
  });
  return nuevoPaquetePromocional;
};

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

const obtenerPaquetesPorHotel = async (idHotel) => {
  const paquetes = await PaquetePromocional.findAll({
    where: { hotelId: idHotel },
    include: [
      {
        model: Habitacion,
        as: 'habitaciones',
        include: [
          {
            model: TipoHabitacion,
            as: 'tipoHabitacion',
            attributes: ['nombre', 'capacidad'],
          },
        ],
        through: {
          model: PaquetePromocionalHabitacion,
          attributes: ['fechaInicio', 'fechaFin'],
        },
      },
    ],
  });

  return paquetes;
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

const verificarAlquileresActualesOFuturos = async (paqueteId) => {
  const hoy = new Date();
  const alquileres = await AlquilerPaquetePromocional.findAll({
    where: {
      paquetePromocionalId: paqueteId,
      fechaFin: { [Op.gte]: hoy },
    },
  });
  return alquileres;
};

const eliminarPaquete = async (hotelId, paqueteId) => {
  paqueteId = Number(paqueteId);
  const paquete = await PaquetePromocional.findOne({
    where: { id: paqueteId, hotelId },
  });

  if (!paquete) {
    throw new CustomError(
      'El paquete promocional no existe o no pertenece a este hotel',
      404,
    );
  }

  // Verificar que no tenga alquileres actuales o futuros
  const alquileres = await verificarAlquileresActualesOFuturos(paqueteId);
  if (alquileres.length > 0) {
    throw new CustomError(
      'No se puede eliminar el paquete porque tiene alquileres vigentes o futuros',
      409,
    );
  }

  const transaction = await sequelize.transaction();
  try {
    // Eliminar registros de la tabla intermedia
    await PaquetePromocionalHabitacion.destroy({
      where: { paquetePromocionalId: paqueteId },
      transaction,
    });

    // Eliminar el paquete
    await paquete.destroy({ transaction });

    await transaction.commit();
    return { message: 'Paquete promocional eliminado correctamente' };
  } catch (error) {
    await transaction.rollback();
    throw new CustomError(
      `Error al eliminar el paquete promocional: ${error.message}`,
      error.statusCode || 500,
    );
  }
};

const actualizarPaquete = async (hotelId, paqueteId, datosPaquete) => {
  paqueteId = Number(paqueteId);
  const paquete = await PaquetePromocional.findOne({
    where: { id: paqueteId, hotelId },
  });

  if (!paquete) {
    throw new CustomError(
      'El paquete promocional no existe o no pertenece a este hotel',
      404,
    );
  }

  // Verificar que no tenga alquileres actuales o futuros
  const alquileres = await verificarAlquileresActualesOFuturos(paqueteId);
  if (alquileres.length > 0) {
    throw new CustomError(
      'No se puede modificar el paquete porque tiene alquileres vigentes o futuros',
      409,
    );
  }

  const nombre = datosPaquete.nombre || paquete.nombre;
  const fechaInicio = datosPaquete.fecha_inicio || paquete.fecha_inicio;
  const fechaFin = datosPaquete.fecha_fin || paquete.fecha_fin;
  const coeficienteDescuento =
    datosPaquete.coeficiente_descuento !== undefined
      ? datosPaquete.coeficiente_descuento
      : paquete.coeficiente_descuento;
  const habitaciones = datosPaquete.habitaciones; // Array de IDs o undefined

  // Verificar nombre duplicado (si cambió)
  if (nombre !== paquete.nombre) {
    const paqueteExistente = await PaquetePromocional.findOne({
      where: {
        nombre,
        hotelId,
        id: { [Op.ne]: paqueteId },
      },
    });
    if (paqueteExistente) {
      throw new CustomError(
        'Ya existe un paquete promocional con el mismo nombre en este hotel',
        409,
      );
    }
  }

  // Verificar porcentaje
  if (datosPaquete.coeficiente_descuento !== undefined) {
    await verificarPorcentaje(datosPaquete.coeficiente_descuento);
  }

  // Obtener habitaciones actuales del paquete
  const habitacionesActuales = await PaquetePromocionalHabitacion.findAll({
    where: { paquetePromocionalId: paqueteId },
    attributes: ['habitacionId'],
  });
  const idsActuales = habitacionesActuales.map((h) => h.habitacionId);

  // Lógica de toggle para habitaciones (si se enviaron)
  if (habitaciones && habitaciones.length > 0) {
    // Las que ya estaban asignadas se quitan, las nuevas se agregan
    const aQuitar = habitaciones.filter((id) => idsActuales.includes(id));
    const aAgregar = habitaciones.filter((id) => !idsActuales.includes(id));
    // Las que no se mencionaron se mantienen
    const aMantener = idsActuales.filter((id) => !habitaciones.includes(id));
    // El resultado final de habitaciones del paquete
    const habitacionesFinales = [...aMantener, ...aAgregar];

    if (habitacionesFinales.length === 0) {
      throw new CustomError(
        'El paquete debe tener al menos una habitación asignada',
        400,
      );
    }

    // Verificar disponibilidad solo de las habitaciones nuevas a agregar
    if (aAgregar.length > 0) {
      // Verificar que no estén en otro paquete en esas fechas
      const conflictoPaquetes = await PaquetePromocionalHabitacion.findAll({
        where: {
          habitacionId: { [Op.in]: aAgregar },
          paquetePromocionalId: { [Op.ne]: paqueteId },
          [Op.or]: [
            { fechaInicio: { [Op.between]: [fechaInicio, fechaFin] } },
            { fechaFin: { [Op.between]: [fechaInicio, fechaFin] } },
            {
              [Op.and]: [
                { fechaInicio: { [Op.lte]: fechaInicio } },
                { fechaFin: { [Op.gte]: fechaFin } },
              ],
            },
          ],
        },
      });
      if (conflictoPaquetes.length > 0) {
        throw new CustomError(
          'Las habitaciones nuevas ya están asignadas a otro paquete en la misma fecha',
          409,
        );
      }

      // Verificar que no estén alquiladas en esas fechas
      const conflictoAlquileres =
        await verificarDisponibilidad.verificarDisponibilidadHabitaciones(
          aAgregar,
          fechaInicio,
          fechaFin,
        );
      if (conflictoAlquileres.length > 0) {
        throw new CustomError(
          'Las habitaciones nuevas ya están alquiladas en el rango de fechas especificado',
          409,
        );
      }
    }

    // Si cambiaron las fechas, verificar que las habitaciones que se mantienen no tengan conflictos
    if (
      (datosPaquete.fecha_inicio || datosPaquete.fecha_fin) &&
      aMantener.length > 0
    ) {
      const conflictoPaquetesMantener =
        await PaquetePromocionalHabitacion.findAll({
          where: {
            habitacionId: { [Op.in]: aMantener },
            paquetePromocionalId: { [Op.ne]: paqueteId },
            [Op.or]: [
              { fechaInicio: { [Op.between]: [fechaInicio, fechaFin] } },
              { fechaFin: { [Op.between]: [fechaInicio, fechaFin] } },
              {
                [Op.and]: [
                  { fechaInicio: { [Op.lte]: fechaInicio } },
                  { fechaFin: { [Op.gte]: fechaFin } },
                ],
              },
            ],
          },
        });
      if (conflictoPaquetesMantener.length > 0) {
        throw new CustomError(
          'Las habitaciones existentes ya están asignadas a otro paquete en las nuevas fechas',
          409,
        );
      }

      const conflictoAlquileresMantener =
        await verificarDisponibilidad.verificarDisponibilidadHabitaciones(
          aMantener,
          fechaInicio,
          fechaFin,
        );
      if (conflictoAlquileresMantener.length > 0) {
        throw new CustomError(
          'Las habitaciones existentes ya están alquiladas en las nuevas fechas',
          409,
        );
      }
    }

    // Recalcular capacidad máxima con las habitaciones finales
    const habitacionesConTipo = await Habitacion.findAll({
      where: { id: { [Op.in]: habitacionesFinales } },
      include: [
        {
          model: TipoHabitacion,
          as: 'tipoHabitacion',
          attributes: ['capacidad'],
        },
      ],
    });
    const capacidadMaxima = habitacionesConTipo.reduce(
      (sum, h) => sum + (h.tipoHabitacion ? h.tipoHabitacion.capacidad : 0),
      0,
    );

    const transaction = await sequelize.transaction();
    try {
      // Actualizar datos del paquete
      await paquete.update(
        {
          nombre,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          coeficiente_descuento: coeficienteDescuento,
          capacidad_maxima: capacidadMaxima,
        },
        { transaction },
      );

      // Quitar habitaciones que ya existían (toggle off)
      if (aQuitar.length > 0) {
        await PaquetePromocionalHabitacion.destroy({
          where: {
            paquetePromocionalId: paqueteId,
            habitacionId: { [Op.in]: aQuitar },
          },
          transaction,
        });
      }

      // Actualizar fechas de las que se mantienen (si cambiaron las fechas)
      if (
        (datosPaquete.fecha_inicio || datosPaquete.fecha_fin) &&
        aMantener.length > 0
      ) {
        await PaquetePromocionalHabitacion.update(
          { fechaInicio, fechaFin },
          {
            where: {
              paquetePromocionalId: paqueteId,
              habitacionId: { [Op.in]: aMantener },
            },
            transaction,
          },
        );
      }

      // Agregar habitaciones nuevas (toggle on)
      for (const habitacionId of aAgregar) {
        await PaquetePromocionalHabitacion.create(
          {
            habitacionId,
            paquetePromocionalId: paqueteId,
            fechaInicio,
            fechaFin,
          },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new CustomError(
        `Error al actualizar el paquete promocional: ${error.message}`,
        error.statusCode || 500,
      );
    }
  } else {
    // Solo actualizar datos básicos del paquete (sin cambiar habitaciones)
    if (datosPaquete.fecha_inicio || datosPaquete.fecha_fin) {
      // Verificar que las habitaciones actuales no tengan conflictos en las nuevas fechas
      if (idsActuales.length > 0) {
        const conflictoPaquetes = await PaquetePromocionalHabitacion.findAll({
          where: {
            habitacionId: { [Op.in]: idsActuales },
            paquetePromocionalId: { [Op.ne]: paqueteId },
            [Op.or]: [
              { fechaInicio: { [Op.between]: [fechaInicio, fechaFin] } },
              { fechaFin: { [Op.between]: [fechaInicio, fechaFin] } },
              {
                [Op.and]: [
                  { fechaInicio: { [Op.lte]: fechaInicio } },
                  { fechaFin: { [Op.gte]: fechaFin } },
                ],
              },
            ],
          },
        });
        if (conflictoPaquetes.length > 0) {
          throw new CustomError(
            'Las habitaciones ya están asignadas a otro paquete en las nuevas fechas',
            409,
          );
        }

        const conflictoAlquileres =
          await verificarDisponibilidad.verificarDisponibilidadHabitaciones(
            idsActuales,
            fechaInicio,
            fechaFin,
          );
        if (conflictoAlquileres.length > 0) {
          throw new CustomError(
            'Las habitaciones ya están alquiladas en las nuevas fechas',
            409,
          );
        }
      }

      const transaction = await sequelize.transaction();
      try {
        await paquete.update(
          {
            nombre,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            coeficiente_descuento: coeficienteDescuento,
          },
          { transaction },
        );

        // Actualizar fechas en la tabla intermedia
        await PaquetePromocionalHabitacion.update(
          { fechaInicio, fechaFin },
          {
            where: { paquetePromocionalId: paqueteId },
            transaction,
          },
        );

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw new CustomError(
          `Error al actualizar el paquete promocional: ${error.message}`,
          error.statusCode || 500,
        );
      }
    } else {
      // Solo actualizar nombre y/o coeficiente
      await paquete.update({
        nombre,
        coeficiente_descuento: coeficienteDescuento,
      });
    }
  }

  return getPaqueteCompleto(paqueteId);
};

module.exports = {
  crearPaquete,
  asignarHabitacionAPaquete,
  obtenerPaquetesPorHotel,
  obtenerPaquetesTuristicos,
  guardarPaquetes,
  eliminarPaquete,
  actualizarPaquete,
};
