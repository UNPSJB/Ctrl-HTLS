const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const Hotel = require('../../models/hotel/Hotel');
const Habitacion = require('../../models/hotel/Habitacion');
const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const DetalleFactura = require('../../models/ventas/DetalleFactura');
const Factura = require('../../models/ventas/Factura');
const Pago = require('../../models/ventas/Pago');
const Alquiler = require('../../models/ventas/Alquiler');
const Cliente = require('../../models/core/Cliente');
const Empleado = require('../../models/core/Empleado');

const obtenerHistorialVentasPorHotel = async (hotelId) => {
  const idNumerico = Number(hotelId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id del hotel no es válido', 400);
  }

  const hotel = await Hotel.findByPk(idNumerico);
  if (!hotel) {
    throw new CustomError('Hotel no encontrado', 404);
  }

  // Obtener habitaciones del hotel
  const habitaciones = await Habitacion.findAll({
    where: { hotelId: idNumerico },
    attributes: ['id'],
    raw: true,
  });
  const habitacionIds = habitaciones.map((h) => h.id);

  // Obtener paquetes promocionales del hotel
  const paquetes = await PaquetePromocional.findAll({
    where: { hotelId: idNumerico },
    attributes: ['id'],
    raw: true,
  });
  const paqueteIds = paquetes.map((p) => p.id);

  // Obtener alquileres relacionados a habitaciones del hotel
  const alquileresHabitacion =
    habitacionIds.length > 0
      ? await AlquilerHabitacion.findAll({
          where: { habitacionId: { [Op.in]: habitacionIds } },
          attributes: ['alquilerId'],
          raw: true,
        })
      : [];
  const alquilerIdsHab = alquileresHabitacion.map((a) => a.alquilerId);

  // Obtener alquileres relacionados a paquetes del hotel
  const alquileresPaquete =
    paqueteIds.length > 0
      ? await AlquilerPaquetePromocional.findAll({
          where: { paquetePromocionalId: { [Op.in]: paqueteIds } },
          attributes: ['alquilerId'],
          raw: true,
        })
      : [];
  const alquilerIdsPaq = alquileresPaquete.map((a) => a.alquilerId);

  // Unificar IDs de alquileres únicos
  const alquilerIds = [...new Set([...alquilerIdsHab, ...alquilerIdsPaq])];

  if (alquilerIds.length === 0) {
    return [];
  }

  // Obtener detalles de factura asociados a esos alquileres
  const detalles = await DetalleFactura.findAll({
    where: { alquilerId: { [Op.in]: alquilerIds } },
    include: [
      {
        model: Factura,
        as: 'factura',
        include: [
          {
            model: Pago,
            as: 'pago',
            attributes: ['tipo_pago'],
          },
        ],
        attributes: ['fecha', 'numero', 'tipo_factura'],
      },
      {
        model: Empleado,
        as: 'empleado',
        attributes: ['nombre', 'apellido'],
      },
      {
        model: Alquiler,
        as: 'alquiler',
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['nombre', 'apellido'],
          },
        ],
        attributes: ['id'],
      },
    ],
    order: [[{ model: Factura, as: 'factura' }, 'fecha', 'DESC']],
  });

  // Mapear a objetos de historial de venta
  return detalles.map((detalle) => {
    const factura = detalle.factura;
    const empleado = detalle.empleado;
    const alquiler = detalle.alquiler;
    const cliente = alquiler ? alquiler.cliente : null;

    return {
      fechaVenta: factura ? factura.fecha : null,
      monto: Number(detalle.subtotal),
      vendedor: empleado ? `${empleado.nombre} ${empleado.apellido}` : null,
      cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : null,
      numeroFactura: factura ? factura.numero : null,
      tipoFactura: factura ? factura.tipo_factura : null,
      metodoPago: factura && factura.pago ? factura.pago.tipo_pago : null,
    };
  });
};

const obtenerVentasPorFecha = async (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') {
    throw new CustomError('La fecha es requerida (formato YYYY-MM-DD)', 400);
  }

  const inicio = new Date(`${fechaStr}T00:00:00.000Z`);
  const fin = new Date(`${fechaStr}T23:59:59.999Z`);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new CustomError(
      'La fecha no tiene un formato válido (YYYY-MM-DD)',
      400,
    );
  }

  const facturas = await Factura.findAll({
    where: {
      fecha: {
        [Op.gte]: inicio,
        [Op.lte]: fin,
      },
    },
    attributes: ['id', 'fecha', 'numero', 'tipo_factura', 'importe_total'],
    order: [['fecha', 'DESC']],
  });

  if (facturas.length === 0) {
    return [];
  }

  const facturaIds = facturas.map((f) => f.id);

  // Obtener detalles con raw:true para leer empleadoId aunque no esté en el modelo
  const detallesRaw = await DetalleFactura.findAll({
    where: { facturaId: { [Op.in]: facturaIds } },
    raw: true,
  });

  const alquilerIds = [
    ...new Set(detallesRaw.map((d) => d.alquilerId).filter(Boolean)),
  ];
  const empleadoIds = [
    ...new Set(detallesRaw.map((d) => d.empleadoId).filter(Boolean)),
  ];

  // Obtener empleados
  const empleados =
    empleadoIds.length > 0
      ? await Empleado.findAll({
          where: { id: { [Op.in]: empleadoIds } },
          attributes: ['id', 'nombre', 'apellido'],
          raw: true,
        })
      : [];
  const empleadoPorId = {};
  empleados.forEach((e) => {
    empleadoPorId[e.id] = e;
  });

  // Obtener alquileres con clientes
  const alquileres =
    alquilerIds.length > 0
      ? await Alquiler.findAll({
          where: { id: { [Op.in]: alquilerIds } },
          include: [
            {
              model: Cliente,
              as: 'cliente',
              attributes: ['nombre', 'apellido'],
            },
          ],
          attributes: ['id'],
        })
      : [];
  const clientePorAlquilerId = {};
  alquileres.forEach((a) => {
    if (a.cliente) {
      clientePorAlquilerId[a.id] = a.cliente;
    }
  });

  // Obtener hoteles por habitaciones
  const alquileresHabitacion =
    alquilerIds.length > 0
      ? await AlquilerHabitacion.findAll({
          where: { alquilerId: { [Op.in]: alquilerIds } },
          attributes: ['alquilerId', 'habitacionId'],
          raw: true,
        })
      : [];
  const habitacionIds = [
    ...new Set(alquileresHabitacion.map((ah) => ah.habitacionId)),
  ];

  const habitacionesConHotel =
    habitacionIds.length > 0
      ? await Habitacion.findAll({
          where: { id: { [Op.in]: habitacionIds } },
          include: [
            {
              model: Hotel,
              as: 'hotel',
              attributes: ['nombre'],
            },
          ],
          attributes: ['id'],
        })
      : [];

  const hotelPorHabitacion = {};
  habitacionesConHotel.forEach((h) => {
    hotelPorHabitacion[h.id] = h.hotel?.nombre;
  });

  const hotelPorAlquilerHab = {};
  alquileresHabitacion.forEach((ah) => {
    if (hotelPorHabitacion[ah.habitacionId]) {
      hotelPorAlquilerHab[ah.alquilerId] = hotelPorHabitacion[ah.habitacionId];
    }
  });

  // Obtener hoteles por paquetes
  const alquileresPaquete =
    alquilerIds.length > 0
      ? await AlquilerPaquetePromocional.findAll({
          where: { alquilerId: { [Op.in]: alquilerIds } },
          attributes: ['alquilerId', 'paquetePromocionalId'],
          raw: true,
        })
      : [];
  const paqueteIds = [
    ...new Set(alquileresPaquete.map((ap) => ap.paquetePromocionalId)),
  ];

  const paquetesConHotel =
    paqueteIds.length > 0
      ? await PaquetePromocional.findAll({
          where: { id: { [Op.in]: paqueteIds } },
          include: [
            {
              model: Hotel,
              as: 'hotel',
              attributes: ['nombre'],
            },
          ],
          attributes: ['id'],
        })
      : [];

  const hotelPorPaquete = {};
  paquetesConHotel.forEach((p) => {
    hotelPorPaquete[p.id] = p.hotel?.nombre;
  });

  const hotelPorAlquilerPaq = {};
  alquileresPaquete.forEach((ap) => {
    if (hotelPorPaquete[ap.paquetePromocionalId]) {
      hotelPorAlquilerPaq[ap.alquilerId] =
        hotelPorPaquete[ap.paquetePromocionalId];
    }
  });

  // Mapear detalles por factura
  const detallePorFactura = {};
  detallesRaw.forEach((d) => {
    if (!detallePorFactura[d.facturaId]) {
      detallePorFactura[d.facturaId] = d;
    }
  });

  return facturas.map((factura) => {
    const detalle = detallePorFactura[factura.id];
    const empleado = detalle ? empleadoPorId[detalle.empleadoId] : null;
    const alquilerId = detalle ? detalle.alquilerId : null;
    const cliente = alquilerId ? clientePorAlquilerId[alquilerId] : null;
    const hotelNombre =
      (alquilerId && hotelPorAlquilerHab[alquilerId]) ||
      (alquilerId && hotelPorAlquilerPaq[alquilerId]) ||
      null;

    return {
      hotel: hotelNombre,
      vendedor: empleado ? `${empleado.nombre} ${empleado.apellido}` : null,
      cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : null,
      monto: Number(factura.importe_total),
    };
  });
};

module.exports = {
  obtenerHistorialVentasPorHotel,
  obtenerVentasPorFecha,
};
