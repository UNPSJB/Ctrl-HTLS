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

    const liquidacionId = resultado.liquidacion.liquidacion.id;
    const pdfBuffer =
      await liquidacionesServices.obtenerPDFRecibo(liquidacionId);

    res.status(201).json({
      ...resultado,
      pdfBase64: pdfBuffer.toString('base64'),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getReciboPDF = async (req, res) => {
  const { id } = req.params;

  try {
    const pdfBuffer = await liquidacionesServices.obtenerPDFRecibo(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=recibo_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getLiquidacionesVendedor = async (req, res) => {
  const { vendedorId } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  try {
    const liquidaciones =
      await liquidacionesServices.obtenerLiquidacionesVendedor(
        vendedorId,
        fechaInicio,
        fechaFin,
      );
    res.status(200).json(liquidaciones);
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
  getReciboPDF,
  getLiquidacionesVendedor,
};
