const CustomError = require('../../utils/CustomError');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');

const getTiposDeHabitacion = async () => {
  try {
    const tiposDeHabitacion = await TipoHabitacion.findAll({ raw: true });
    return tiposDeHabitacion;
  } catch (error) {
    throw new CustomError(
      `Error al obtener los tipos de habitación: ${error.message}`,
      500,
    ); // Internal Server Error
  }
};

const getTipoHabitacion = async (id) => {
  try {
    const tipoHabitacion = await TipoHabitacion.findOne({
      where: { id },
      raw: true,
    });
    return tipoHabitacion;
  } catch (error) {
    throw new CustomError(
      `Error al obtener el tipo de habitación: ${error.message}`,
      500,
    ); // Internal Server Error
  }
};

module.exports = {
  getTiposDeHabitacion,
  getTipoHabitacion,
};
