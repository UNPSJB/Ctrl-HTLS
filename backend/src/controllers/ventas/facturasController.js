const facturaServices = require('../../services/ventas/facturasServices');

const setFactura = async (req, res) => {
  const { alquilerIds, vendedorId } = req.body;

  try {
    const factura = await facturaServices.generarFactura(
      alquilerIds,
      vendedorId,
    );
    res.status(201).json(factura);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const confirmarPago = async (req, res) => {
  const {
    alquileres,
    tipoFact,
    medioPago,
    montoEfectivo,
    montoTarjeta,
    montonEfectivo,
    montonTarjeta,
    montoTotal,
    vendedorId,
    clienteId,
  } = req.body;

  const efectivo = montoEfectivo ?? montonEfectivo ?? 0;
  const tarjeta = montoTarjeta ?? montonTarjeta ?? 0;

  try {
    const resultado = await facturaServices.confirmarPago(
      alquileres,
      tipoFact,
      medioPago,
      efectivo,
      tarjeta,
      montoTotal,
      vendedorId,
      clienteId,
    );

    const { pdfBuffer, ...datosFactura } = resultado;

    res.status(201).json({
      ...datosFactura,
      pdfBase64: pdfBuffer.toString('base64'),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  setFactura,
  confirmarPago,
};
