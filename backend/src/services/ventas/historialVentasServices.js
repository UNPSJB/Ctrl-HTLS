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
  const alquileresHabitacion = await AlquilerHabitacion.findAll({
    where: habitacionIds.length > 0
      ? { habitacionId: { [Op.in]: habitacionIds } }
      : { id: null },
    attributes: ['alquilerId'],
    raw: true,
  });
  const alquilerIdsHab = alquileresHabitacion.map((a) => a.alquilerId);

  // Obtener alquileres relacionados a paquetes del hotel
  const alquileresPaquete = await AlquilerPaquetePromocional.findAll({
    where: paqueteIds.length > 0
      ? { paquetePromocionalId: { [Op.in]: paqueteIds } }
      : { id: null },
    attributes: ['alquilerId'],
    raw: true,
  });
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

module.exports = {
  obtenerHistorialVentasPorHotel,
};
