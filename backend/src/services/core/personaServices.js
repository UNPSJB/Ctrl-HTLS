const Empleado = require('../../models/core/Empleado');
const Cliente = require('../../models/core/Cliente');
const Encargado = require('../../models/hotel/Encargado');
const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const bcrypt = require('bcrypt');
const {
  verificarCiudad,
  verificarEmail,
  verificarTelefono,
  verificarDocumento,
} = require('../../utils/helpers');
const Hotel = require('../../models/hotel/Hotel');
const HotelEmpleado = require('../../models/hotel/HotelEmpleado');
const DetalleFactura = require('../../models/ventas/DetalleFactura');
const Liquidacion = require('../../models/ventas/Liquidacion');

const incluirRelacionesVendedor = [
  {
    model: Hotel,
    as: 'hoteles',
    attributes: ['id', 'nombre'],
    through: { attributes: [] },
  },
  {
    model: DetalleFactura,
    as: 'detallesFactura',
    attributes: ['id', 'descripcion', 'subtotal', 'facturaId', 'liquidacionId'],
  },
  {
    model: Liquidacion,
    as: 'liquidaciones',
    attributes: ['id', 'numero', 'fecha_emision', 'fecha_pago', 'total'],
  },
];

const formatearVendedor = (vendedor) => ({
  id: vendedor.id,
  nombre: vendedor.nombre,
  apellido: vendedor.apellido,
  tipoDocumento: vendedor.tipoDocumento,
  numeroDocumento: vendedor.numeroDocumento,
  email: vendedor.email,
  telefono: vendedor.telefono,
  direccion: vendedor.direccion,
  hotelesPermitidos: (vendedor.hoteles || []).map((hotel) => ({
    id: hotel.id,
    nombre: hotel.nombre,
  })),
  ventas: (vendedor.detallesFactura || []).map((detalle) => ({
    id: detalle.id,
    descripcion: detalle.descripcion,
    subtotal: Number(detalle.subtotal),
    facturaId: detalle.facturaId,
    liquidacionId: detalle.liquidacionId,
  })),
  liquidaciones: (vendedor.liquidaciones || []).map((liquidacion) => ({
    id: liquidacion.id,
    numero: liquidacion.numero,
    fechaEmision: liquidacion.fecha_emision,
    fechaPago: liquidacion.fecha_pago,
    total: Number(liquidacion.total),
  })),
});

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

  // Actualizar el empleado
  await empleadoExistente.update({
    nombre,
    apellido,
    email,
    rol,
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

  const asignacion = await HotelEmpleado.findOne({
    where: { empleadoId: id },
  });
  if (asignacion) {
    throw new CustomError(
      'No se puede eliminar al vendedor porque está asignado a un hotel',
      409,
    );
  }

  const ventaSinLiquidar = await DetalleFactura.findOne({
    where: {
      empleadoId: id,
      liquidacionId: { [Op.is]: null },
    },
  });
  if (ventaSinLiquidar) {
    throw new CustomError(
      'No se puede eliminar al vendedor porque tiene ventas sin liquidar',
      409,
    );
  }

  await empleado.destroy();
};

const obtenerVendedores = async () => {
  const vendedores = await Empleado.findAll({
    where: { rol: 'vendedor' },
    include: incluirRelacionesVendedor,
  });

  return vendedores.map(formatearVendedor);
};

const obtenerVendedorPorId = async (id) => {
  const vendedor = await Empleado.findByPk(id, {
    include: incluirRelacionesVendedor,
  });

  if (!vendedor) {
    throw new CustomError('Vendedor no encontrado', 404);
  }

  if (vendedor.rol !== 'vendedor') {
    throw new CustomError('El empleado no es un vendedor', 404);
  }

  return formatearVendedor(vendedor);
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

  const documentoEncargado = await Encargado.findOne({
    where: { dni: numeroDocumento, id: { [Op.ne]: id } },
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
  try {
    await verificarEmail(email);
    await verificarTelefono(telefono);
    await verificarDocumento(numeroDocumento);
  } catch (error) {
    throw new CustomError(error.message, error.statusCode);
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
