const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const { Op } = require('sequelize');

const verificarDisponibilidadHabitaciones = async (
  habitaciones,
  fechaInicio,
  fechaFin,
) => {
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
  return habitacionesAlquiladas;
};

const verificarHabitacionesPaquetePromocional = async (
  habitaciones,
  fechaInicio,
  fechaFin,
) => {
  const habitacionesAlquiladas = await PaquetePromocionalHabitacion.findAll({
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

  return habitacionesAlquiladas;
};

const verificarDisponibilidadPaquetes = async (
  paquetes,
  fechaInicio,
  fechaFin,
) => {
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

  return paquetesAlquilados;
};

module.exports = {
  verificarDisponibilidadHabitaciones,
  verificarHabitacionesPaquetePromocional,
  verificarDisponibilidadPaquetes,
};
