const Empleado = require('../../models/core/Empleado');
const Cliente = require('../../models/core/Cliente');
const Ciudad = require('../../models/core/Ciudad');
const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const bcrypt = require('bcrypt');
const { where } = require('sequelize');
const { verificarCiudad } = require('../../utils/helpers');

const crearEmpleado = async (empleado) => {
  const {
    nombre,
    apellido,
    email,
    rol,
    password,
    telefono,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudadId,
  } = empleado;

  // Verificar datos
  await verificarExistente(numeroDocumento, email, telefono);
  await verificarCiudad(ciudadId);

  // Hash la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo empleado
  const nuevoEmpleado = await Empleado.create({
    nombre,
    apellido,
    email,
    rol,
    password: hashedPassword,
    telefono,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudadId,
  });

  return nuevoEmpleado;
};

const crearCliente = async (cliente) => {
  const { nombre, apellido, email, telefono, tipoDocumento, numeroDocumento } =
    cliente;

  // Verificar datos
  await verificarExistente(numeroDocumento, email, telefono);

  // Crear el nuevo cliente
  const nuevoCliente = await Cliente.create({
    nombre,
    apellido,
    email,
    telefono,
    tipoDocumento,
    numeroDocumento,
    puntos: 0,
  });

  return nuevoCliente;
};

const actualizarCliente = async (id, cliente) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    tipoDocumento,
    numeroDocumento,
    puntos,
  } = cliente;

  // Verificar si el cliente existe
  const clienteExistente = await Cliente.findByPk(id);
  if (!clienteExistente) {
    throw new CustomError('Cliente no encontrado', 404);
  }

  // Verificar datos
  await verificarUpdate(numeroDocumento, email, telefono, id);

  // Actualizar el cliente
  await clienteExistente.update({
    nombre,
    apellido,
    email,
    telefono,
    tipoDocumento,
    numeroDocumento,
    puntos,
  });

  return clienteExistente;
};

const obtenerClientes = async () => {
  const clientes = await Cliente.findAll();
  return clientes;
};

const obtenerClientePorId = async (id) => {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    throw new CustomError('Cliente no encontrado', 404);
  }
  return cliente;
};

const verificarUpdate = async (numeroDocumento, email, telefono, id) => {
  // Verificar si el email ya existe
  const emailCliente = await Cliente.findOne({
    where: { email, id: { [Op.ne]: id } },
  });
  const emailEmpleado = await Empleado.findOne({
    where: { email, id: { [Op.ne]: id } },
  });
  const emailExistente = emailCliente || emailEmpleado;

  if (emailExistente) {
    throw new CustomError('El email ya está registrado', 409); // Conflict
  }

  const documentoCliente = await Cliente.findOne({
    where: { numeroDocumento, id: { [Op.ne]: id } },
  });

  const documentoEmpleado = await Empleado.findOne({
    where: { numeroDocumento, id: { [Op.ne]: id } },
  });
  const documentoExistente = documentoCliente || documentoEmpleado;

  if (documentoExistente) {
    throw new CustomError('El número de documento ya está registrado', 409); // Conflict
  }

  const telefonoCliente = await Cliente.findOne({
    where: { telefono, id: { [Op.ne]: id } },
  });

  const telefonoEmpleado = await Empleado.findOne({
    where: { telefono, id: { [Op.ne]: id } },
  });

  const telefonoExistente = telefonoCliente || telefonoEmpleado;

  if (telefonoExistente) {
    throw new CustomError('El teléfono ya está registrado', 409); // Conflict
  }
};

const verificarExistente = async (numeroDocumento, email, telefono) => {
  const emailEmpleado = await Empleado.findOne({ where: { email } });
  const emailCliente = await Cliente.findOne({ where: { email } });
  const existingEmail = emailEmpleado || emailCliente;
  if (existingEmail) {
    throw new CustomError('El email ya está registrado', 409); // Conflict
  }

  // Verificar si el número de documento ya existe
  const documentoEmpleado = await Empleado.findOne({
    where: { numeroDocumento },
  });
  const documentoCliente = await Cliente.findOne({
    where: { numeroDocumento },
  });
  const existingDocumento = documentoEmpleado || documentoCliente;
  if (existingDocumento) {
    throw new CustomError('El número de documento ya está registrado', 409); // Conflict
  }

  // Verificar si el teléfono ya existe
  const telefonoEmpleado = await Empleado.findOne({ where: { telefono } });
  const telefonoCliente = await Cliente.findOne({ where: { telefono } });
  const existingTelefono = telefonoEmpleado || telefonoCliente;

  if (existingTelefono) {
    throw new CustomError('El teléfono ya está registrado', 409); // Conflict
  }
};

module.exports = {
  crearEmpleado,
  crearCliente,
  actualizarCliente,
  obtenerClientes,
  obtenerClientePorId,
};
