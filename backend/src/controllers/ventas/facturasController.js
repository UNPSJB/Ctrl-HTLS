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

module.exports = {
  setFactura,
};
