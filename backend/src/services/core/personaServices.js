const Empleado = require('../../models/core/Empleado');
const Cliente = require('../../models/core/Cliente');
const Encargado = require('../../models/hotel/Encargado');
const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const bcrypt = require('bcrypt');
const { verificarCiudad } = require('../../utils/helpers');

/**
 * Crea un nuevo empleado.
 *
 * @param {Object} empleado - Los datos del empleado a crear.
 * @param {string} empleado.nombre - El nombre del empleado.
 * @param {string} empleado.apellido - El apellido del empleado.
 * @param {string} empleado.email - El email del empleado.
 * @param {string} empleado.rol - El rol del empleado (administrador, vendedor, desarrollador).
 * @param {string} empleado.password - La contraseña del empleado.
 * @param {string} [empleado.telefono] - El teléfono del empleado (opcional).
 * @param {string} empleado.tipoDocumento - El tipo de documento del empleado (dni, li, le, pasaporte).
 * @param {string} empleado.numeroDocumento - El número de documento del empleado.
 * @param {string} empleado.direccion - La dirección del empleado.
 * @param {number} empleado.ciudadId - El ID de la ciudad del empleado.
 * @returns {Promise<Object>} El empleado creado.
 * @throws {CustomError} Si el email o el número de documento ya están registrados, o si la ciudad no existe.
 */
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

const actualizarEmpleado = async (id, empleado) => {
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

  // Verificar si el empleado existe
  const empleadoExistente = await Empleado.findByPk(id);
  if (!empleadoExistente) {
    throw new CustomError('Empleado no encontrado', 404);
  }

  // Verificar datos
  await verificarUpdate(numeroDocumento, email, telefono, id);
  await verificarCiudad(ciudadId);

  // Hash la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Actualizar el empleado
  await empleadoExistente.update({
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

  return empleadoExistente;
};

const eliminarEmpleado = async (id) => {
  const empleado = await Empleado.findByPk(id);
  if (!empleado) {
    throw new CustomError('Empleado no encontrado', 404);
  }

  // Verificar el rol del empleado
  if (empleado.rol !== 'vendedor') {
    throw new CustomError(
      'Solo se pueden eliminar empleados con rol de vendedor',
      403,
    ); // Forbidden
  }

  await empleado.destroy();
};

const obtenerVendedores = async () => {
  const vendedores = await Empleado.findAll({
    where: { rol: 'vendedor' },
  });
  return vendedores;
};

const obtenerVendedorPorId = async (id) => {
  const vendedor = await Empleado.findByPk(id);
  if (!vendedor) {
    throw new CustomError('Vendedor no encontrado', 404);
  }

  if (vendedor.rol !== 'vendedor') {
    throw new CustomError('El empleado no es un vendedor', 404);
  }

  return vendedor;
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

const eliminarCliente = async (id) => {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    throw new CustomError('Cliente no encontrado', 404);
  }

  await cliente.destroy();
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

const obtenerClientePorDocumento = async (numeroDocumento) => {
  const cliente = await Cliente.findOne({
    where: { numeroDocumento },
  });
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

  const emailEncargado = await Encargado.findOne({
    where: { email, id: { [Op.ne]: id } },
  });

  const emailExistente = emailCliente || emailEmpleado || emailEncargado;

  if (emailExistente) {
    throw new CustomError('El email ya está registrado', 409); // Conflict
  }

  const documentoCliente = await Cliente.findOne({
    where: { numeroDocumento, id: { [Op.ne]: id } },
  });

  const documentoEmpleado = await Empleado.findOne({
    where: { numeroDocumento, id: { [Op.ne]: id } },
  });

  const documentoEncargado = await Encargado.findOne({
    where: { numeroDocumento, id: { [Op.ne]: id } },
  });

  const documentoExistente =
    documentoCliente || documentoEmpleado || documentoEncargado;

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

  const emailEncargado = await Encargado.findOne({ where: { email } });

  const existingEmail = emailEmpleado || emailCliente || emailEncargado;
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

  const documentoEncargado = await Encargado.findOne({
    where: { numeroDocumento },
  });

  const existingDocumento =
    documentoEmpleado || documentoCliente || documentoEncargado;
  if (existingDocumento) {
    throw new CustomError('El número de documento ya está registrado', 409); // Conflict
  }

  // Verificar si el teléfono ya existe
  const telefonoEmpleado = await Empleado.findOne({ where: { telefono } });
  const telefonoCliente = await Cliente.findOne({ where: { telefono } });
  const telefonoEncargado = await Encargado.findOne({ where: { telefono } });

  const existingTelefono =
    telefonoEmpleado || telefonoCliente || telefonoEncargado;
  if (existingTelefono) {
    throw new CustomError('El teléfono ya está registrado', 409); // Conflict
  }
};

const actualizarPuntosCliente = async (clienteId, puntos, transaction) => {
  const cliente = await Cliente.findByPk(clienteId, { transaction });
  if (!cliente) {
    throw new Error('Cliente no encontrado.');
  }

  cliente.puntos += puntos;
  await cliente.save({ transaction });
};

module.exports = {
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerVendedores,
  obtenerVendedorPorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  obtenerClientes,
  obtenerClientePorId,
  obtenerClientePorDocumento,
  actualizarPuntosCliente,
};
