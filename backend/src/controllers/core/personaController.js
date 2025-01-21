const { validationResult } = require('express-validator');

const personaServices = require('../../services/core/personaServices');

const createEmpleado = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const empleado = await personaServices.crearEmpleado(req.body);
    return res.status(201).json(empleado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const createCliente = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const cliente = await personaServices.crearCliente(req.body);
    return res.status(201).json(cliente);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const updateCliente = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;

  try {
    const cliente = await personaServices.actualizarCliente(id, req.body);
    return res.status(200).json(cliente);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const getClientes = async (req, res) => {
  try {
    const clientes = await personaServices.obtenerClientes();
    return res.status(200).json(clientes);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const getClienteById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;

  try {
    const cliente = await personaServices.obtenerClientePorId(id);
    return res.status(200).json(cliente);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  createEmpleado,
  createCliente,
  updateCliente,
  getClientes,
  getClienteById,
};
