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

const liquidarVendedor = async (req, res) => {
  const { vendedorId } = req.params;
  const { fechaInicio, fechaFin } = req.body;

  try {
    const resultado = await liquidacionesServices.liquidarVendedorPorId(
      vendedorId,
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

const liquidarVendedorPorDetallesController = async (req, res) => {
  const { vendedorId } = req.params;
  const { detalleIds } = req.body;

  if (!detalleIds || !Array.isArray(detalleIds) || detalleIds.length === 0) {
    return res.status(400).json({
      message: 'Por favor ingresa un array de detalleIds.',
    });
  }

  try {
    const resultado = await liquidacionesServices.liquidarVendedorPorDetalles(
      vendedorId,
      detalleIds,
    );
    res.status(201).json(resultado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  liquidarComisiones,
  liquidarVendedor,
  listarLiquidaciones,
  liquidarVendedorPorDetalles: liquidarVendedorPorDetallesController,
};
