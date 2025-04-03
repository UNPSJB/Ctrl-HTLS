const alquilerServices = require('../../services/ventas/alquilerServices');

const getDisponibilidad = async (req, res) => {
  const consultaAlquiler = req.query;

  try {
    const disponibilidad =
      await alquilerServices.obtenerDisponibilidad(consultaAlquiler);
    res.status(200).json(disponibilidad);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { getDisponibilidad };
