const liquidacionesServices = require('../../services/ventas/liquidacionesServices');

const liquidarComisiones = async (req, res) => {
  const { fechaInicio, fechaFin } = req.body;

  try {
    const resultado = await liquidacionesServices.liquidarComisiones(
      fechaInicio,
      fechaFin,
    );
    res.status(201).json(resultado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const listarLiquidaciones = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  try {
    const resultado = await liquidacionesServices.obtenerLiquidaciones(
      fechaInicio,
      fechaFin,
    );
    res.status(200).json(resultado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  liquidarComisiones,
  listarLiquidaciones,
};
