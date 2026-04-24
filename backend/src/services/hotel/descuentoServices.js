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

const eliminarDescuento = async (hotelId, descuentoId) => {
  const descuento = await Descuento.findOne({
    where: { id: descuentoId, hotelId },
  });

  if (!descuento) {
    throw new CustomError(
      'El descuento no existe o no pertenece a este hotel',
      404,
    );
  }

  await descuento.destroy();
  return { message: 'Descuento eliminado correctamente' };
};

module.exports = {
  crearDescuento,
  verificarDescuentoExistente,
  eliminarDescuento,
};
