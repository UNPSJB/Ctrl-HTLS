const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const CustomError = require('../../utils/CustomError');
const DetalleFactura = require('../../models/ventas/DetalleFactura');
const Liquidacion = require('../../models/ventas/Liquidacion');
const Factura = require('../../models/ventas/Factura');
const Empleado = require('../../models/core/Empleado');

const PARCIAL_COMISION = 0.02;

const parsearFecha = (valor, nombre) => {
  const fecha = new Date(valor);
  if (!valor || Number.isNaN(fecha.getTime())) {
    throw new CustomError(`La fecha ${nombre} no es válida`, 400);
  }
  return fecha;
};

const obtenerUltimoNumeroLiquidacion = async (transaction) => {
  const ultimaLiquidacion = await Liquidacion.findOne({
    attributes: ['numero'],
    order: [['numero', 'DESC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  return ultimaLiquidacion ? ultimaLiquidacion.numero : 0;
};

const liquidarComisiones = async (fechaInicio, fechaFin) => {
  const desde = parsearFecha(fechaInicio, 'de inicio');
  const hasta = parsearFecha(fechaFin, 'de fin');

  if (desde > hasta) {
    throw new CustomError('La fecha de inicio debe ser anterior a la fecha fin', 400);
  }

  const hastaFinDeDia = new Date(hasta);
  hastaFinDeDia.setHours(23, 59, 59, 999);

  const transaction = await sequelize.transaction();

  try {
    const detallesPendientes = await DetalleFactura.findAll({
      where: {
        liquidacionId: null,
        empleadoId: { [Op.ne]: null },
      },
      include: [
        {
          model: Factura,
          as: 'factura',
          attributes: [],
          where: {
            fecha: {
              [Op.between]: [desde, hastaFinDeDia],
            },
          },
        },
      ],
      attributes: ['id', 'empleadoId', 'subtotal'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!detallesPendientes.length) {
      await transaction.rollback();
      return {
        message: 'No hay comisiones pendientes para el rango indicado',
        liquidaciones: [],
      };
    }

    const detallesPorVendedor = new Map();

    detallesPendientes.forEach((detalle) => {
      const vendedorId = detalle.empleadoId;
      if (!detallesPorVendedor.has(vendedorId)) {
        detallesPorVendedor.set(vendedorId, {
          detalleIds: [],
          totalVentas: 0,
        });
      }

      const entrada = detallesPorVendedor.get(vendedorId);
      entrada.detalleIds.push(detalle.id);
      entrada.totalVentas += Number(detalle.subtotal);
    });

    if (!detallesPorVendedor.size) {
      await transaction.rollback();
      return {
        message: 'No hay comisiones pendientes para el rango indicado',
        liquidaciones: [],
      };
    }

    let ultimoNumero = await obtenerUltimoNumeroLiquidacion(transaction);
    const liquidacionesGeneradas = [];
    const fechaEmision = new Date();

    for (const [empleadoId, info] of detallesPorVendedor.entries()) {
      if (!info.detalleIds.length || info.totalVentas <= 0) {
        continue;
      }

      ultimoNumero += 1;
      const totalComision = Number((info.totalVentas * PARCIAL_COMISION).toFixed(2));

      const liquidacion = await Liquidacion.create(
        {
          numero: ultimoNumero,
          fecha_emision: fechaEmision,
          fecha_pago: null,
          total: totalComision,
          empleadoId,
        },
        { transaction },
      );

      await DetalleFactura.update(
        { liquidacionId: liquidacion.id },
        {
          where: { id: info.detalleIds },
          transaction,
        },
      );

      liquidacionesGeneradas.push({
        liquidacion: liquidacion.toJSON(),
        totalVentas: Number(info.totalVentas.toFixed(2)),
        comision: totalComision,
        detalles: info.detalleIds,
      });
    }

    await transaction.commit();

    if (!liquidacionesGeneradas.length) {
      return {
        message: 'No se generaron liquidaciones para el rango indicado',
        liquidaciones: [],
      };
    }

    return {
      message: 'Liquidaciones generadas correctamente',
      liquidaciones: liquidacionesGeneradas,
    };
  } catch (error) {
    await transaction.rollback();
    throw new CustomError(
      `Error al liquidar comisiones: ${error.message}`,
      error.statusCode || 500,
    );
  }
};

const obtenerLiquidaciones = async (fechaInicio, fechaFin) => {
  const where = {};

  if (fechaInicio) {
    const desde = parsearFecha(fechaInicio, 'de inicio');
    where.fecha_emision = { ...where.fecha_emision, [Op.gte]: desde };
  }

  if (fechaFin) {
    const hasta = parsearFecha(fechaFin, 'de fin');
    const hastaFinDeDia = new Date(hasta);
    hastaFinDeDia.setHours(23, 59, 59, 999);
    where.fecha_emision = { ...where.fecha_emision, [Op.lte]: hastaFinDeDia };
  }

  const liquidaciones = await Liquidacion.findAll({
    where,
    include: [
      {
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre', 'apellido'],
      },
      {
        model: DetalleFactura,
        as: 'detallesFactura',
        attributes: ['id', 'subtotal'],
      },
    ],
    order: [['fecha_emision', 'DESC']],
  });

  return liquidaciones;
};

module.exports = {
  liquidarComisiones,
  obtenerLiquidaciones,
};
