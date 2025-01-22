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

const updateEmpleado = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;

  try {
    const empleado = await personaServices.actualizarEmpleado(id, req.body);
    return res.status(200).json(empleado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

// VERIFICAR QUE NO TENGA LIQUIDACIONES SIN COBRAR
const deleteEmpleado = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;

  try {
    await personaServices.eliminarEmpleado(id);
    return res.status(204).json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const getVendedores = async (req, res) => {
  try {
    const vendedores = await personaServices.obtenerVendedores();
    return res.status(200).json(vendedores);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

const getVendedor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const vendedor = await personaServices.obtenerVendedorPorId(id);
    return res.status(200).json(vendedor);
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

// FALTA VERIFICAR QUE NO TENGA RESERVAS ACTIVAS
const deleteCliente = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;

  try {
    await personaServices.eliminarCliente(id);
    return res.status(204).json({ message: 'Cliente eliminado exitosamente' });
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
  updateEmpleado,
  deleteEmpleado,
  getVendedores,
  getVendedor,
  createCliente,
  updateCliente,
  deleteCliente,
  getClientes,
  getClienteById,
};
