const CustomError = require('../../utils/CustomError');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');

const asociarTipoHabitacionAHotel = async (
  hotelId,
  idTipoHabitacion,
  precio,
  transaction,
) => {
  try {
    await HotelTipoHabitacion.create(
      {
        hotelId,
        tipoHabitacionId: idTipoHabitacion,
        precio,
      },
      { transaction },
    );
  } catch (error) {
    throw new CustomError(
      `Error al asociar tipo de habitación a hotel: ${error.message}`,
      500,
    );
  }
};

const getTipoHabitacionesDeHotel = async (hotelId) => {
  try {
    return await HotelTipoHabitacion.findAll({
      where: { hotelId },
      raw: true,
    });
  } catch (error) {
    throw new CustomError(
      `Error al obtener los tipos de habitación del hotel: ${error.message}`,
      500,
    ); // Internal Server Error
  }
};

const getTipoHabitacionDeHotel = async (hotelId, tipoHabitacionId) => {
  try {
    return await HotelTipoHabitacion.findOne({
      where: {
        hotelId,
        tipoHabitacionId,
      },
    });
  } catch (error) {
    throw new CustomError(
      `Ocurrio un error al obtener el tipo de habitacion ${error.message}`,
      500,
    );
  }
};

module.exports = {
  asociarTipoHabitacionAHotel,
  getTipoHabitacionesDeHotel,
  getTipoHabitacionDeHotel,
};
