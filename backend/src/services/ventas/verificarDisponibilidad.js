const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
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

const verificarDisponibilidadPaquetes = async (paquetes) => {
  if (!paquetes || paquetes.length === 0) return [];

  // Obtener las fechas reales de cada paquete desde la BD
  const paquetesDB = await PaquetePromocional.findAll({
    where: { id: { [Op.in]: paquetes } },
    attributes: ['id', 'fecha_inicio', 'fecha_fin'],
  });

  // Verificar disponibilidad usando las fechas propias de cada paquete
  const paquetesAlquilados = [];
  for (const paquete of paquetesDB) {
    const alquileres = await AlquilerPaquetePromocional.findAll({
      where: {
        paquetePromocionalId: paquete.id,
        [Op.or]: [
          {
            fechaInicio: {
              [Op.between]: [paquete.fecha_inicio, paquete.fecha_fin],
            },
          },
          {
            fechaFin: {
              [Op.between]: [paquete.fecha_inicio, paquete.fecha_fin],
            },
          },
          {
            [Op.and]: [
              { fechaInicio: { [Op.lte]: paquete.fecha_inicio } },
              { fechaFin: { [Op.gte]: paquete.fecha_fin } },
            ],
          },
        ],
      },
    });
    paquetesAlquilados.push(...alquileres);
  }

  return paquetesAlquilados;
};

module.exports = {
  verificarDisponibilidadHabitaciones,
  verificarHabitacionesPaquetePromocional,
  verificarDisponibilidadPaquetes,
};
