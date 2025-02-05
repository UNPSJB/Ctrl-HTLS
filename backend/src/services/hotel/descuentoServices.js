const CustomError = require('../../utils/CustomError');
const Descuento = require('../../models/hotel/Descuento');

const crearDescuento = async (idHotel, descuento) => {
  try {
    const descuentoNuevo = await Descuento.create({
      hotelId: idHotel,
      ...descuento,
    });
    return descuentoNuevo;
  } catch (error) {
    console.error(error);
    throw new CustomError('Ocurrio un error inesperado', 404);
  }
};

const verificarDescuentoExistente = async (idHotel, descuento) => {
  const descuentoExistente = await Descuento.findOne({
    where: {
      hotelId: idHotel,
      cantidad_de_habitaciones: descuento.cantidad_de_habitaciones,
    },
  });
  if (descuentoExistente) {
    throw new CustomError(
      'Ya existe un descuento con esa cantidad de habitaciones',
      409,
    );
  }
};

module.exports = { crearDescuento, verificarDescuentoExistente };
