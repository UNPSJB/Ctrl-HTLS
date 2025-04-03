const Temporada = require('../../models/hotel/Temporada');
const CustomError = require('../../utils/CustomError');
const { Op } = require('sequelize');

const crearTemporada = async (idHotel, temporada) => {
  try {
    const temporadaNueva = await Temporada.create({
      hotelId: idHotel,
      ...temporada,
    });
    return temporadaNueva;
  } catch (error) {
    console.error(error);
    throw new CustomError('Ocurrio un error inesperado', 404);
  }
};

const verificarTemporadas = async (idHotel, inicio, fin) => {
  const temporadas = await Temporada.findAll({
    where: {
      hotelId: idHotel,
      [Op.or]: [
        {
          fechaInicio: {
            [Op.between]: [inicio, fin],
          },
        },
        {
          fechaFin: {
            [Op.between]: [inicio, fin],
          },
        },
        {
          [Op.and]: [
            {
              fechaInicio: {
                [Op.lte]: inicio,
              },
            },
            {
              fechaFin: {
                [Op.gte]: fin,
              },
            },
          ],
        },
      ],
    },
  });

  if (temporadas.length > 0) {
    throw new CustomError('Ya existe una temporada en esas fechas', 409);
  }
};

const obtenerTemporadaActual = async (idHotel, fechaInicio, fechaFin) => {
  const temporada = await Temporada.findOne({
    where: {
      hotelId: idHotel,
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

  if (!temporada) {
    return null;
  }

  return {
    tipo: temporada.tipo,
    fechaInicio: temporada.fechaInicio,
    fechaFin: temporada.fechaFin,
    porcentaje: temporada.porcentaje,
  };
};

module.exports = {
  crearTemporada,
  verificarTemporadas,
  obtenerTemporadaActual,
};
