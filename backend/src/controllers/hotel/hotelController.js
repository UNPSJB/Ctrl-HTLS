const { validationResult } = require('express-validator');
const hotelServices = require('../../services/hotel/hotelServices');

const createHotel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    nombre,
    direccion,
    telefono,
    email,
    tipoHabitaciones,
    ciudadId,
    encargadoId,
    categoriaId,
  } = req.body;

  try {
    const hotel = await hotelServices.crearHotel(
      nombre,
      direccion,
      telefono,
      email,
      tipoHabitaciones,
      ciudadId,
      encargadoId,
      categoriaId,
    );
    res.status(201).json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const updateHotel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
    nombre,
    direccion,
    telefono,
    email,
    ciudadId,
    encargadoId,
    categoriaId,
  } = req.body;

  try {
    const hotel = await hotelServices.modificarHotel(
      id,
      nombre,
      direccion,
      telefono,
      email,
      ciudadId,
      encargadoId,
      categoriaId,
    );
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await hotelServices.obtenerCategorias();
    res.json(categorias);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const setHabitaciones = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const habitaciones = req.body;

  try {
    const hotel = await hotelServices.agregarHabitaciones(id, habitaciones);
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { createHotel, updateHotel, getCategorias, setHabitaciones };
