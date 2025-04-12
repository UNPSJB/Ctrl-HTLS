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

const setReserva = async (req, res) => {
  const reserva = req.body;

  try {
    //const resultado = await alquilerServices.crearReserva(reserva);
    await alquilerServices.crearReserva(reserva);
    res.status(201).json({ message: 'Reserva creada con éxito' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { getDisponibilidad, setReserva };
