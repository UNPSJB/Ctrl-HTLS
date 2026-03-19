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

const getAllHoteles = async (req, res) => {
  try {
    const hoteles = await hotelServices.obtenerTodosLosHoteles();
    res.json(hoteles);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getHotelById = async (req, res) => {
  const hotelId = req.params.id;
  try {
    const hotel = await hotelServices.getHotelById(hotelId);
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getTarifas = async (req, res) => {
  const { id } = req.params;
  try {
    const tarifas = await hotelServices.obtenerTarifasDeHotel(id);
    res.json(tarifas);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const updateTarifas = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { tarifas } = req.body;

  try {
    const tarifasActualizadas = await hotelServices.actualizarTarifasDeHotel(
      id,
      tarifas,
    );
    res.json(tarifasActualizadas);
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
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  const habitaciones = payload.map((habitacion) => {
    const numero =
      habitacion.numero ??
      habitacion.numeroHabitacion ??
      habitacion.numero_habitacion;
    const tipoHabitacionId =
      habitacion.idTipoHabitacion ??
      habitacion.tipoHabitacionId ??
      habitacion.tipo_habitacion_id;

    return {
      numero,
      piso: habitacion.piso,
      idTipoHabitacion: tipoHabitacionId,
    };
  });

  try {
    const hotel = await habitacionServices.crearHabitaciones(id, habitaciones);
    res.json(hotel);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getHabitaciones = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const habitaciones = await habitacionServices.obtenerHabitaciones(id);
    res.json(habitaciones);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getPaquetes = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const paquetes = await hotelServices.obtenerPaquetesDeHotel(id);
    res.json(paquetes);
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

const getTemporadas = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const temporadas = await hotelServices.obtenerTemporadasDeHotel(id);
    res.json(temporadas);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const deleteTemporada = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id, idTemporada } = req.params;

  try {
    const resultado = await hotelServices.eliminarTemporadaDeHotel(
      id,
      idTemporada,
    );
    res.json(resultado);
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

const getDescuentos = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const descuentos = await hotelServices.getDescuentosDeHotel(id);
    res.json(descuentos);
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

const createEncargado = async (req, res) => {
  const { nombre, apellido, tipoDocumento, numeroDocumento, telefono } =
    req.body;

  try {
    const encargado = await hotelServices.crearEncargado(
      nombre,
      apellido,
      tipoDocumento,
      numeroDocumento,
      telefono,
    );
    res.status(201).json(encargado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  } finally {
    console.log('createEncargado executed');
  }
};

const getEncargados = async (req, res) => {
  try {
    const encargados = await hotelServices.obtenerEncargados();
    res.json(encargados);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const deleteEncargado = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await hotelServices.deleteEncargado(id);
    res.status(200).json(resultado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const asignarEmpleado = async (req, res) => {
  const { hotelId, vendedorId } = req.body;
  try {
    const asignacion = await hotelServices.asignarEmpleadoAHotel(
      hotelId,
      vendedorId,
    );
    res.status(201).json(asignacion);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const desasignarEmpleado = async (req, res) => {
  const { hotelId, vendedorId } = req.body;
  try {
    const resultado = await hotelServices.desasignarEmpleadoDeHotel(
      hotelId,
      vendedorId,
    );
    res.status(200).json(resultado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  createHotel,
  updateHotel,
  getAllHoteles,
  getHotelById,
  getCategorias,
  getHabitaciones,
  getPaquetes,
  getTarifas,
  setTemporada,
  getTemporadas,
  deleteTemporada,
  setHabitaciones,
  setDescuento,
  getDescuentos,
  updateHabitacion,
  deleteHabitacion,
  setPaquetePromocional,
  getTiposDeHabitacion,
  createEncargado,
  getEncargados,
  deleteEncargado,
  asignarEmpleado,
  desasignarEmpleado,
  updateTarifas,
};
