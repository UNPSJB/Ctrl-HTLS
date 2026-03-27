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

const obtenerTemporadasPorHotel = async (hotelId) => {
  try {
    const temporadas = await Temporada.findAll({
      where: { hotelId },
      attributes: ['id', 'tipo', 'fechaInicio', 'fechaFin', 'porcentaje'],
      order: [['fechaInicio', 'ASC']],
    });
    return temporadas;
  } catch (error) {
    throw new CustomError(
      `Error al obtener las temporadas del hotel: ${error.message}`,
      500,
    );
  }
};

const eliminarTemporada = async (hotelId, temporadaId) => {
  try {
    const temporada = await Temporada.findOne({
      where: { id: temporadaId, hotelId },
    });

    if (!temporada) {
      throw new CustomError(
        'La temporada no existe o no pertenece a este hotel',
        404,
      );
    }

    await temporada.destroy();
    return { message: 'Temporada eliminada correctamente' };
  } catch (error) {
    throw new CustomError(
      `Error al eliminar la temporada: ${error.message}`,
      error.statusCode || 500,
    );
  }
};

const actualizarTemporada = async (hotelId, temporadaId, datosTemporada) => {
  const temporada = await Temporada.findOne({
    where: { id: temporadaId, hotelId },
  });

  if (!temporada) {
    throw new CustomError(
      'La temporada no existe o no pertenece a este hotel',
      404,
    );
  }

  // Verificar superposición con otras temporadas (excluyendo la actual)
  if (datosTemporada.fechaInicio && datosTemporada.fechaFin) {
    const temporadasSuperpuestas = await Temporada.findAll({
      where: {
        hotelId,
        id: { [Op.ne]: temporadaId },
        [Op.or]: [
          {
            fechaInicio: {
              [Op.between]: [
                datosTemporada.fechaInicio,
                datosTemporada.fechaFin,
              ],
            },
          },
          {
            fechaFin: {
              [Op.between]: [
                datosTemporada.fechaInicio,
                datosTemporada.fechaFin,
              ],
            },
          },
          {
            [Op.and]: [
              {
                fechaInicio: {
                  [Op.lte]: datosTemporada.fechaInicio,
                },
              },
              {
                fechaFin: {
                  [Op.gte]: datosTemporada.fechaFin,
                },
              },
            ],
          },
        ],
      },
    });

    if (temporadasSuperpuestas.length > 0) {
      throw new CustomError('Ya existe una temporada en esas fechas', 409);
    }
  }

  await temporada.update(datosTemporada);
  return temporada;
};

module.exports = {
  crearTemporada,
  verificarTemporadas,
  obtenerTemporadaActual,
  obtenerTemporadasPorHotel,
  eliminarTemporada,
  actualizarTemporada,
};
