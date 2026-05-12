const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const CustomError = require('../../utils/CustomError');
const DetalleFactura = require('../../models/ventas/DetalleFactura');
const Liquidacion = require('../../models/ventas/Liquidacion');
const Factura = require('../../models/ventas/Factura');
const Empleado = require('../../models/core/Empleado');

const { generarPDFRecibo } = require('./pdfReciboService');

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
    throw new CustomError(
      'La fecha de inicio debe ser anterior a la fecha fin',
      400,
    );
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
      const totalComision = Number(
        (info.totalVentas * PARCIAL_COMISION).toFixed(2),
      );

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

const liquidarVendedorPorId = async (vendedorId, fechaInicio, fechaFin) => {
  const idNumerico = Number(vendedorId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id del vendedor no es válido', 400);
  }

  const vendedor = await Empleado.findByPk(idNumerico);
  if (!vendedor || vendedor.rol !== 'vendedor') {
    throw new CustomError('Vendedor no encontrado', 404);
  }

  if (!fechaInicio || !fechaFin) {
    throw new CustomError('Debe indicar fecha de inicio y fin', 400);
  }

  const desde = parsearFecha(fechaInicio, 'de inicio');
  const hasta = parsearFecha(fechaFin, 'de fin');

  if (desde > hasta) {
    throw new CustomError(
      'La fecha de inicio debe ser anterior a la fecha fin',
      400,
    );
  }

  const hastaFinDeDia = new Date(hasta);
  hastaFinDeDia.setHours(23, 59, 59, 999);

  const transaction = await sequelize.transaction();

  try {
    const detallesPendientes = await DetalleFactura.findAll({
      where: {
        liquidacionId: null,
        empleadoId: idNumerico,
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
      attributes: ['id', 'subtotal'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!detallesPendientes.length) {
      await transaction.rollback();
      return {
        message:
          'El vendedor no tiene comisiones pendientes para el rango indicado',
        liquidacion: null,
      };
    }

    const totalVentas = detallesPendientes.reduce(
      (acumulado, detalle) => acumulado + Number(detalle.subtotal),
      0,
    );

    if (totalVentas <= 0) {
      await transaction.rollback();
      return {
        message: 'El vendedor no posee montos pendientes para liquidar',
        liquidacion: null,
      };
    }

    const ultimoNumero =
      (await obtenerUltimoNumeroLiquidacion(transaction)) + 1;
    const comision = Number((totalVentas * PARCIAL_COMISION).toFixed(2));
    const fechaEmision = new Date();

    const liquidacion = await Liquidacion.create(
      {
        numero: ultimoNumero,
        fecha_emision: fechaEmision,
        fecha_pago: null,
        total: comision,
        empleadoId: idNumerico,
      },
      { transaction },
    );

    const detalleIds = detallesPendientes.map((detalle) => detalle.id);
    await DetalleFactura.update(
      { liquidacionId: liquidacion.id },
      {
        where: { id: detalleIds },
        transaction,
      },
    );

    await transaction.commit();

    return {
      message: 'Liquidación generada correctamente',
      liquidacion: {
        liquidacion: liquidacion.toJSON(),
        totalVentas: Number(totalVentas.toFixed(2)),
        comision,
        detalles: detalleIds,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw new CustomError(
      `Error al liquidar vendedor: ${error.message}`,
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

const liquidarVendedorPorDetalles = async (vendedorId, detalleIds) => {
  const idNumerico = Number(vendedorId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id del vendedor no es válido', 400);
  }

  const facturaIds = detalleIds;

  if (!Array.isArray(facturaIds) || facturaIds.length === 0) {
    throw new CustomError('Debe proporcionar al menos un id de venta', 400);
  }

  const vendedor = await Empleado.findByPk(idNumerico);
  if (!vendedor || vendedor.rol !== 'vendedor') {
    throw new CustomError('Vendedor no encontrado', 404);
  }

  const transaction = await sequelize.transaction();

  try {
    const detallesPendientes = await DetalleFactura.findAll({
      where: {
        facturaId: { [Op.in]: facturaIds },
        liquidacionId: null,
        empleadoId: idNumerico,
      },
      attributes: ['id', 'subtotal', 'facturaId'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const facturasEncontradas = [
      ...new Set(detallesPendientes.map((d) => d.facturaId)),
    ];
    const facturasNoEncontradas = facturaIds.filter(
      (id) => !facturasEncontradas.includes(id),
    );

    if (facturasNoEncontradas.length > 0) {
      await transaction.rollback();
      throw new CustomError(
        `Algunas facturas no existen, ya están liquidadas o no pertenecen al vendedor: ${facturasNoEncontradas.join(', ')}`,
        400,
      );
    }

    const totalVentas = detallesPendientes.reduce(
      (acumulado, detalle) => acumulado + Number(detalle.subtotal),
      0,
    );

    if (totalVentas <= 0) {
      await transaction.rollback();
      return {
        message: 'El vendedor no posee montos pendientes para liquidar',
        liquidacion: null,
      };
    }

    const ultimoNumero =
      (await obtenerUltimoNumeroLiquidacion(transaction)) + 1;
    const comision = Number((totalVentas * PARCIAL_COMISION).toFixed(2));
    const fechaEmision = new Date();

    const liquidacion = await Liquidacion.create(
      {
        numero: ultimoNumero,
        fecha_emision: fechaEmision,
        fecha_pago: fechaEmision,
        total: comision,
        empleadoId: idNumerico,
      },
      { transaction },
    );

    const detallesActualizados = detallesPendientes.map(
      (detalle) => detalle.id,
    );
    await DetalleFactura.update(
      { liquidacionId: liquidacion.id },
      {
        where: { id: detallesActualizados },
        transaction,
      },
    );

    await transaction.commit();

    return {
      message: 'Liquidación generada correctamente',
      liquidacion: {
        liquidacion: liquidacion.toJSON(),
        totalVentas: Number(totalVentas.toFixed(2)),
        comision,
        detalles: detallesActualizados,
      },
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw new CustomError(
      `Error al liquidar vendedor: ${error.message}`,
      error.statusCode || 500,
    );
  }
};

const obtenerPDFRecibo = async (liquidacionId) => {
  const idNumerico = Number(liquidacionId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id de la liquidación no es válido', 400);
  }

  const liquidacion = await Liquidacion.findByPk(idNumerico, {
    include: [
      {
        model: Empleado,
        as: 'empleado',
        attributes: ['id', 'nombre', 'apellido'],
      },
      {
        model: DetalleFactura,
        as: 'detallesFactura',
        attributes: ['id', 'descripcion', 'subtotal', 'facturaId'],
        include: [
          {
            model: Factura,
            as: 'factura',
            attributes: ['id', 'numero', 'fecha'],
          },
        ],
      },
    ],
  });

  if (!liquidacion) {
    throw new CustomError('Liquidación no encontrada', 404);
  }

  if (!liquidacion.empleado) {
    throw new CustomError('No se encontró el vendedor de la liquidación', 404);
  }

  // Agrupar detalles por factura
  const ventasPorFactura = (liquidacion.detallesFactura || []).reduce(
    (acc, detalle) => {
      const fId = detalle.facturaId;
      if (!acc[fId]) {
        acc[fId] = {
          numero: detalle.factura ? detalle.factura.numero : null,
          fecha: detalle.factura ? detalle.factura.fecha : null,
          monto: 0,
        };
      }
      acc[fId].monto += Number(detalle.subtotal);
      return acc;
    },
    {},
  );

  const ventas = Object.values(ventasPorFactura).map((v) => ({
    descripcion: `Factura N° ${String(v.numero).padStart(8, '0')} - ${new Date(v.fecha).toLocaleDateString('es-AR')}`,
    subtotal: v.monto,
  }));

  const pdfBuffer = await generarPDFRecibo(
    liquidacion,
    liquidacion.empleado,
    ventas,
  );

  return pdfBuffer;
};

const obtenerLiquidacionesVendedor = async (
  vendedorId,
  fechaInicio,
  fechaFin,
) => {
  const idNumerico = Number(vendedorId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id del vendedor no es válido', 400);
  }

  const vendedor = await Empleado.findByPk(idNumerico);
  if (!vendedor || vendedor.rol !== 'vendedor') {
    throw new CustomError('Vendedor no encontrado', 404);
  }

  if (!fechaInicio || !fechaFin) {
    throw new CustomError('Debe indicar fecha de inicio y fin', 400);
  }

  const [startYear, startMonth, startDay] = fechaInicio.split('-').map(Number);
  const [endYear, endMonth, endDay] = fechaFin.split('-').map(Number);

  const desde = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
  const hastaFinDeDia = new Date(
    endYear,
    endMonth - 1,
    endDay,
    23,
    59,
    59,
    999,
  );

  if (Number.isNaN(desde.getTime())) {
    throw new CustomError('La fecha de inicio no es válida', 400);
  }
  if (Number.isNaN(hastaFinDeDia.getTime())) {
    throw new CustomError('La fecha de fin no es válida', 400);
  }

  if (desde > hastaFinDeDia) {
    throw new CustomError(
      'La fecha de inicio debe ser anterior a la fecha fin',
      400,
    );
  }

  const liquidaciones = await Liquidacion.findAll({
    where: {
      empleadoId: idNumerico,
      fecha_emision: {
        [Op.between]: [desde, hastaFinDeDia],
      },
    },
    attributes: ['id', 'numero', 'fecha_emision', 'fecha_pago', 'total'],
    order: [['fecha_emision', 'ASC']],
  });

  return liquidaciones.map((l) => ({
    id: l.id,
    numero: l.numero,
    fechaEmision: l.fecha_emision,
    fechaPago: l.fecha_pago,
    total: Number(l.total),
  }));
};

module.exports = {
  liquidarComisiones,
  liquidarVendedorPorId,
  obtenerLiquidaciones,
  liquidarVendedorPorDetalles,
  obtenerPDFRecibo,
  obtenerLiquidacionesVendedor,
};
