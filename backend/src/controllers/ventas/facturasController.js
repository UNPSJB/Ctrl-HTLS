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

const getFacturaPDF = async (req, res) => {
  const { id } = req.params;

  try {
    const pdfBuffer = await facturaServices.obtenerPDFFactura(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=factura_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getVentasResumen = async (req, res) => {
  try {
    const resumen = await facturaServices.obtenerVentasResumen();
    res.status(200).json(resumen);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const buscarVentas = async (req, res) => {
  const { fechaInicio, fechaFin, dniCliente, dniVendedor, nombreHotel } =
    req.query;

  try {
    const ventas = await facturaServices.buscarVentas({
      fechaInicio,
      fechaFin,
      dniCliente,
      dniVendedor,
      nombreHotel,
    });
    res.status(200).json(ventas);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getDetalleFactura = async (req, res) => {
  const { id } = req.params;

  try {
    const detalle = await facturaServices.obtenerDetalleFactura(id);
    res.status(200).json(detalle);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  setFactura,
  confirmarPago,
  getVentasResumen,
  getFacturaPDF,
  buscarVentas,
  getDetalleFactura,
};
