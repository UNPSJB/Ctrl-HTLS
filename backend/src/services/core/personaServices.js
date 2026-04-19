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
const Alquiler = require('../../models/ventas/Alquiler');
const Factura = require('../../models/ventas/Factura');

const Ciudad = require('../../models/core/Ciudad');
const Provincia = require('../../models/core/Provincia');
const Pais = require('../../models/core/Pais');

const incluirCiudadCompleta = {
  model: Ciudad,
  as: 'ciudad',
  include: [
    {
      model: Provincia,
      as: 'provincia',
      include: [
        {
          model: Pais,
          as: 'pais',
        },
      ],
    },
  ],
};

const incluirRelacionesVendedor = [
  {
    model: Hotel,
    as: 'hoteles',
    attributes: ['id', 'nombre'],
    through: { attributes: [] },
    where: { eliminado: false },
    required: false,
  },
  {
    model: DetalleFactura,
    as: 'detallesFactura',
    attributes: ['id', 'descripcion', 'subtotal', 'facturaId', 'liquidacionId'],
    include: [
      {
        model: Factura,
        as: 'factura',
        attributes: ['fecha'],
      },
    ],
  },
  {
    model: Liquidacion,
    as: 'liquidaciones',
    attributes: ['id', 'numero', 'fecha_emision', 'fecha_pago', 'total'],
  },
  incluirCiudadCompleta,
];

const mapUbicacion = (persona) => {
  if (!persona.ciudad) {
    return null;
  }

  return {
    ciudadId: persona.ciudad.id,
    ciudadNombre: persona.ciudad.nombre,
    provinciaId: persona.ciudad.provincia ? persona.ciudad.provincia.id : null,
    provinciaNombre: persona.ciudad.provincia
      ? persona.ciudad.provincia.nombre
      : null,
    paisId:
      persona.ciudad.provincia && persona.ciudad.provincia.pais
        ? persona.ciudad.provincia.pais.id
        : null,
    paisNombre:
      persona.ciudad.provincia && persona.ciudad.provincia.pais
        ? persona.ciudad.provincia.pais.nombre
        : null,
  };
};

const formatearVendedor = (vendedor) => ({
  id: vendedor.id,
  nombre: vendedor.nombre,
  apellido: vendedor.apellido,
  tipoDocumento: vendedor.tipoDocumento,
  numeroDocumento: vendedor.numeroDocumento,
  email: vendedor.email,
  telefono: vendedor.telefono,
  direccion: vendedor.direccion,
  ciudadId: vendedor.ciudadId,
  // Datos de ubicación extendidos para el frontend
  ubicacion: mapUbicacion(vendedor),
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
    fechaVenta: detalle.factura ? detalle.factura.fecha : null,
  })),
  liquidaciones: (vendedor.liquidaciones || []).map((liquidacion) => ({
    id: liquidacion.id,
    numero: liquidacion.numero,
    fechaEmision: liquidacion.fecha_emision,
    fechaPago: liquidacion.fecha_pago,
    total: Number(liquidacion.total),
  })),
});

const formatearAdministrador = (administrador) => ({
  id: administrador.id,
  nombre: administrador.nombre,
  apellido: administrador.apellido,
  tipoDocumento: administrador.tipoDocumento,
  numeroDocumento: administrador.numeroDocumento,
  email: administrador.email,
  telefono: administrador.telefono,
  direccion: administrador.direccion,
  ciudadId: administrador.ciudadId,
  rol: administrador.rol,
  ubicacion: mapUbicacion(administrador),
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

  const empleadoJSON = nuevoEmpleado.toJSON();
  delete empleadoJSON.password;
  return empleadoJSON;
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

const actualizarAdministrador = async (id, datosAdministrador) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudadId,
  } = datosAdministrador;

  // Verificar si el empleado existe
  const empleadoExistente = await Empleado.findByPk(id);
  if (!empleadoExistente) {
    throw new CustomError('Administrador no encontrado', 404);
  }

  // Verificar que sea administrador
  if (empleadoExistente.rol !== 'administrador') {
    throw new CustomError('El empleado no es un administrador', 403);
  }

  // Verificar datos
  await verificarUpdate(numeroDocumento, email, telefono, id);
  await verificarCiudad(ciudadId);

  // Actualizar solo los campos permitidos (sin modificar rol ni password)
  await empleadoExistente.update({
    nombre,
    apellido,
    email,
    telefono,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudadId,
  });

  const administradorActualizado = await Empleado.findByPk(id, {
    include: [incluirCiudadCompleta],
  });

  return formatearAdministrador(administradorActualizado);
};

const obtenerVentasVendedor = async (id) => {
  const vendedor = await Empleado.findByPk(id, {
    include: [
      {
        model: DetalleFactura,
        as: 'detallesFactura',
        attributes: [
          'id',
          'descripcion',
          'subtotal',
          'facturaId',
          'liquidacionId',
        ],
        include: [
          {
            model: Factura,
            as: 'factura',
            attributes: ['fecha'],
          },
        ],
      },
    ],
  });

  if (!vendedor) {
    throw new CustomError('Vendedor no encontrado', 404);
  }

  if (vendedor.rol !== 'vendedor') {
    throw new CustomError('El empleado no es un vendedor', 403);
  }

  const ventas = (vendedor.detallesFactura || []).map((detalle) => ({
    id: detalle.id,
    descripcion: detalle.descripcion,
    subtotal: Number(detalle.subtotal),
    facturaId: detalle.facturaId,
    liquidacionId: detalle.liquidacionId,
    fechaVenta: detalle.factura ? detalle.factura.fecha : null,
  }));

  return {
    vendedorId: vendedor.id,
    vendedorNombre: `${vendedor.nombre} ${vendedor.apellido}`,
    totalVentas: ventas.length,
    montoTotal: ventas.reduce((sum, v) => sum + v.subtotal, 0),
    ventas,
  };
};

const obtenerVentasCliente = async (id) => {
  const cliente = await Cliente.findByPk(id, {
    include: [
      {
        model: Alquiler,
        as: 'alquileres',
        include: [
          {
            model: DetalleFactura,
            as: 'detalleFactura',
            attributes: [
              'id',
              'descripcion',
              'precio_unitario',
              'subtotal',
              'facturaId',
            ],
            include: [
              {
                model: Factura,
                as: 'factura',
                attributes: [
                  'id',
                  'numero',
                  'fecha',
                  'tipo_factura',
                  'importe_total',
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!cliente) {
    throw new CustomError('Cliente no encontrado', 404);
  }

  const ventas = (cliente.alquileres || []).map((alquiler) => ({
    alquilerId: alquiler.id,
    fechaInicio: alquiler.fecha_inicio,
    fechaFin: alquiler.fecha_fin,
    pasajeros: alquiler.pasajeros,
    importeTotal: Number(alquiler.importe_total),
    detalle: alquiler.detalleFactura
      ? {
          id: alquiler.detalleFactura.id,
          descripcion: alquiler.detalleFactura.descripcion,
          precioUnitario: Number(alquiler.detalleFactura.precio_unitario),
          subtotal: Number(alquiler.detalleFactura.subtotal),
          factura: alquiler.detalleFactura.factura
            ? {
                id: alquiler.detalleFactura.factura.id,
                numero: alquiler.detalleFactura.factura.numero,
                fecha: alquiler.detalleFactura.factura.fecha,
                tipoFactura: alquiler.detalleFactura.factura.tipo_factura,
                importeTotal: Number(
                  alquiler.detalleFactura.factura.importe_total,
                ),
              }
            : null,
        }
      : null,
  }));

  return {
    clienteId: cliente.id,
    clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
    totalVentas: ventas.length,
    montoTotal: ventas.reduce((sum, v) => sum + v.importeTotal, 0),
    ventas,
  };
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

const obtenerAdministradores = async () => {
  const administradores = await Empleado.findAll({
    where: { rol: 'administrador' },
    include: [incluirCiudadCompleta],
  });

  return administradores.map(formatearAdministrador);
};

const obtenerAdministradorPorId = async (id) => {
  const administrador = await Empleado.findByPk(id, {
    include: [incluirCiudadCompleta],
  });

  if (!administrador) {
    throw new CustomError('Administrador no encontrado', 404);
  }

  if (administrador.rol !== 'administrador') {
    throw new CustomError('El empleado no es un administrador', 404);
  }

  return formatearAdministrador(administrador);
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
  const promesas = [
    Cliente.findOne({ where: { email, id: { [Op.ne]: id } } }),
    Empleado.findOne({ where: { email, id: { [Op.ne]: id } } }),
    Cliente.findOne({ where: { numeroDocumento, id: { [Op.ne]: id } } }),
    Empleado.findOne({ where: { numeroDocumento, id: { [Op.ne]: id } } }),
    Encargado.findOne({ where: { dni: numeroDocumento, id: { [Op.ne]: id } } }),
  ];

  // Solo verificar teléfono si viene con valor
  const verificarTel = telefono && telefono.trim() !== '';
  if (verificarTel) {
    promesas.push(
      Cliente.findOne({ where: { telefono, id: { [Op.ne]: id } } }),
      Empleado.findOne({ where: { telefono, id: { [Op.ne]: id } } }),
    );
  }

  const resultados = await Promise.all(promesas);

  const [
    emailCliente,
    emailEmpleado,
    documentoCliente,
    documentoEmpleado,
    documentoEncargado,
  ] = resultados;

  if (emailCliente || emailEmpleado) {
    throw new CustomError('Ya existe un registro con el mismo email', 409); // Conflict
  }

  if (documentoCliente || documentoEmpleado || documentoEncargado) {
    throw new CustomError('Ya existe un registro con el mismo documento', 409); // Conflict
  }

  if (verificarTel) {
    const telefonoCliente = resultados[5];
    const telefonoEmpleado = resultados[6];
    if (telefonoCliente || telefonoEmpleado) {
      throw new CustomError('Ya existe un registro con el mismo teléfono', 409); // Conflict
    }
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
  actualizarAdministrador,
  obtenerVentasVendedor,
  obtenerVentasCliente,
  eliminarEmpleado,
  obtenerAdministradores,
  obtenerAdministradorPorId,
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
