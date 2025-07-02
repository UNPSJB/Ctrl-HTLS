const { validationResult } = require('express-validator');
const hotelServices = require('../../services/hotel/hotelServices');
const habitacionServices = require('../../services/hotel/habitacionServices');

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
    const hotel = await habitacionServices.crearHabitaciones(id, habitaciones);
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const updateHabitacion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id, idHabitacion } = req.params;
  const habitacion = req.body;

  try {
    const hotel = await habitacionServices.modificarHabitacion(
      id,
      idHabitacion,
      habitacion,
    );
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const deleteHabitacion = async (req, res) => {
  const { id, idHabitacion } = req.params;

  try {
    await habitacionServices.eliminarHabitacion(id, idHabitacion);
    res.json({ message: 'La habitación fue eliminada exitosamente' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const setPaquetePromocional = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const paquete = req.body;

  try {
    const hotel = await hotelServices.agregarPaquetePromocional(id, paquete);
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const setTemporada = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const temporada = req.body;

  try {
    const temporadaNueva = await hotelServices.agregarTemporada(id, temporada);
    res.json(temporadaNueva);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const setDescuento = async (req, res) => {
  const { id } = req.params;
  const descuento = req.body;

  try {
    const descuentoNuevo = await hotelServices.agregarDescuentos(id, descuento);
    res.json(descuentoNuevo);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getTiposDeHabitacion = async (req, res) => {
  try {
    const tipos = await hotelServices.obtenerTiposDeHabitacion();
    res.json(tipos);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  createHotel,
  updateHotel,
  getCategorias,
  setTemporada,
  setHabitaciones,
  setDescuento,
  updateHabitacion,
  deleteHabitacion,
  setPaquetePromocional,
  getTiposDeHabitacion,
};
