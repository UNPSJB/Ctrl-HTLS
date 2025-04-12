const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const { Op } = require('sequelize');

const verificarDisponibilidadHabitaciones = async (
  habitaciones,
  fechaInicio,
  fechaFin,
) => {
  if (!habitaciones || habitaciones.length === 0) return;

  const habitacionesAlquiladas = await AlquilerHabitacion.findAll({
    where: {
      habitacionId: { [Op.in]: habitaciones },
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

  if (habitacionesAlquiladas.length > 0) {
    throw new Error(
      'Algunas habitaciones ya están alquiladas en el rango de fechas especificado.',
    );
  }
};

const verificarDisponibilidadPaquetes = async (
  paquetes,
  fechaInicio,
  fechaFin,
) => {
  if (!paquetes || paquetes.length === 0) return;

  const paquetesAlquilados = await AlquilerPaquetePromocional.findAll({
    where: {
      paquetePromocionalId: { [Op.in]: paquetes },
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

  if (paquetesAlquilados.length > 0) {
    throw new Error(
      'Algunos paquetes ya están alquilados en el rango de fechas especificado.',
    );
  }
};

module.exports = {
  verificarDisponibilidadHabitaciones,
  verificarDisponibilidadPaquetes,
};
