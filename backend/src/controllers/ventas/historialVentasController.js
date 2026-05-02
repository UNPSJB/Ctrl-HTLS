const historialVentasServices = require('../../services/ventas/historialVentasServices');

const getHistorialVentas = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const historial =
      await historialVentasServices.obtenerHistorialVentasPorHotel(hotelId);
    res.status(200).json(historial);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  getHistorialVentas,
};
