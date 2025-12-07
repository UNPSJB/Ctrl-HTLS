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
    const resultado = await alquilerServices.crearReserva(reserva);
    res.status(201).json(resultado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const updateReserva = async (req, res) => {
  const reservas = req.body;
  try {
    let reservasActualizada =
      await alquilerServices.actualizarReserva(reservas);
    res.status(200).json(reservasActualizada);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const deleteReserva = async (req, res) => {
  const { alquilerIds } = req.body; // Recibe un arreglo de IDs de alquileres

  try {
    // Llamar al servicio para cancelar las reservas
    await alquilerServices.cancelarReserva(alquilerIds);
    res.status(200).json({ message: 'Reservas canceladas con éxito' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  getDisponibilidad,
  setReserva,
  updateReserva,
  deleteReserva,
};
