const sequelize = require('../../config/database');
const CustomError = require('../../utils/CustomError');
const Factura = require('../../models/ventas/Factura');
const DetalleFactura = require('../../models/ventas/DetalleFactura');
const Pago = require('../../models/ventas/Pago');
const Alquiler = require('../../models/ventas/Alquiler');
const Cliente = require('../../models/core/Cliente');
const { generarPDFFactura } = require('./pdfFacturaService');

const generarFactura = async (alquilerIds, vendedorId) => {};

const normalizarTipoFactura = (tipo) => {
  if (!tipo) {
    throw new CustomError('El tipo de factura es requerido', 400);
  }

  const permitido = ['A', 'B', 'C'];
  const tipoUpper = tipo.toUpperCase();

  if (!permitido.includes(tipoUpper)) {
    throw new CustomError(
      `Tipo de factura inválido. Debe ser uno de: ${permitido.join(', ')}`,
      400,
    );
  }

  return tipoUpper;
};

const normalizarTipoPago = (tipoPago) => {
  if (!tipoPago) {
    throw new CustomError('El tipo de pago es requerido', 400);
  }

  const mapa = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    mixto: 'Mixto',
    puntos: 'Puntos',
  };

  const clave = tipoPago.toLowerCase();
  const resultado = mapa[clave];

  if (!resultado) {
    throw new CustomError(
      `Tipo de pago inválido. Debe ser uno de: ${Object.values(mapa).join(', ')}`,
      400,
    );
  }

  return resultado;
};

const obtenerSiguienteNumeroFactura = async (transaction) => {
  const ultimaFactura = await Factura.findOne({
    attributes: ['numero'],
    order: [['numero', 'DESC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  return ultimaFactura ? ultimaFactura.numero + 1 : 1;
};

const confirmarPago = async (
  alquileres,
  tipoFact,
  medioPago,
  montoEfectivo,
  montoTarjeta,
  montoTotal,
  vendedorId,
  clienteId,
) => {
  if (!Array.isArray(alquileres) || alquileres.length === 0) {
    throw new CustomError('Debe indicar al menos un alquiler para facturar', 400);
  }

  if (!vendedorId) {
    throw new CustomError('El vendedor es requerido', 400);
  }

  if (!clienteId) {
    throw new CustomError('El cliente es requerido', 400);
  }

  if (!montoTotal || Number(montoTotal) <= 0) {
    throw new CustomError('El monto total debe ser mayor a 0', 400);
  }

  const totalDetalles = alquileres.reduce(
    (acc, item) => acc + Number(item.subTotal || 0),
    0,
  );

  if (Number(totalDetalles.toFixed(2)) !== Number(Number(montoTotal).toFixed(2))) {
    throw new CustomError(
      'La suma de los subtotales de alquiler no coincide con el monto total',
      400,
    );
  }

  const tipoFacturaNormalizado = normalizarTipoFactura(tipoFact);
  const tipoPagoNormalizado = normalizarTipoPago(medioPago);

  const efectivo = Number(montoEfectivo ?? 0);
  const tarjeta = Number(montoTarjeta ?? 0);

  if (Number.isNaN(efectivo) || Number.isNaN(tarjeta)) {
    throw new CustomError('Los montos de efectivo o tarjeta no son válidos', 400);
  }

  const coincideTotal = (a, b) => Math.abs(Number(a) - Number(b)) < 0.01;

  if (tipoPagoNormalizado === 'Efectivo') {
    if (efectivo <= 0) {
      throw new CustomError(
        'Debe indicar un monto en efectivo mayor a cero para este tipo de pago',
        400,
      );
    }

    if (!coincideTotal(efectivo, montoTotal)) {
      throw new CustomError(
        'El monto en efectivo debe coincidir con el total de la venta',
        400,
      );
    }
  } else if (tipoPagoNormalizado === 'Tarjeta') {
    if (tarjeta <= 0) {
      throw new CustomError(
        'Debe indicar un monto con tarjeta mayor a cero para este tipo de pago',
        400,
      );
    }

    if (!coincideTotal(tarjeta, montoTotal)) {
      throw new CustomError(
        'El monto con tarjeta debe coincidir con el total de la venta',
        400,
      );
    }
  } else if (tipoPagoNormalizado === 'Mixto') {
    if (efectivo <= 0 || tarjeta <= 0) {
      throw new CustomError(
        'Para pagos mixtos debe especificar montos mayores a cero en efectivo y tarjeta',
        400,
      );
    }

    if (!coincideTotal(efectivo + tarjeta, montoTotal)) {
      throw new CustomError(
        'La suma de efectivo y tarjeta debe coincidir con el total de la venta',
        400,
      );
    }
  }

  const transaction = await sequelize.transaction();

  try {
    const alquilerIds = alquileres.map((item) => item.alquilerId);

    const alquileresDb = await Alquiler.findAll({
      where: { id: alquilerIds },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (alquileresDb.length !== alquilerIds.length) {
      throw new CustomError('Uno o más alquileres no existen', 404);
    }

    const cliente = await Cliente.findByPk(clienteId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cliente) {
      throw new CustomError('El cliente no existe', 404);
    }

    let puntosDelta = 0;

    if (tipoPagoNormalizado === 'Puntos') {
      const puntosNecesarios = Math.ceil(Number(montoTotal));
      if (cliente.puntos < puntosNecesarios) {
        throw new CustomError(
          'El cliente no posee puntos suficientes para cubrir la compra',
          400,
        );
      }
      puntosDelta -= puntosNecesarios;
    } else if (tipoPagoNormalizado === 'Efectivo') {
      const puntosGanados = Math.floor(Number(montoTotal) / 5);
      if (puntosGanados > 0) {
        puntosDelta += puntosGanados;
      }
    }

    const pago = await Pago.create(
      {
        importe: montoTotal,
        tipo_pago: tipoPagoNormalizado,
        importe_efectivo: efectivo > 0 ? efectivo : null,
        importe_tarjeta: tarjeta > 0 ? tarjeta : null,
      },
      { transaction },
    );

    const numeroFactura = await obtenerSiguienteNumeroFactura(transaction);

    const factura = await Factura.create(
      {
        fecha: new Date(),
        numero: numeroFactura,
        tipo_factura: tipoFacturaNormalizado,
        importe_total: montoTotal,
        pagoId: pago.id,
      },
      { transaction },
    );

    const detallesCreados = [];

    for (const detalle of alquileres) {
      const alquilerRelacionado = alquileresDb.find(
        (alquilerDb) => alquilerDb.id === detalle.alquilerId,
      );

      const detalleFactura = await DetalleFactura.create(
        {
          facturaId: factura.id,
          alquilerId: alquilerRelacionado.id,
          empleadoId: vendedorId,
          subtotal: detalle.subTotal,
          precio_unitario: detalle.subTotal,
          descripcion: detalle.descripcion || `Alquiler #${alquilerRelacionado.id}`,
        },
        { transaction },
      );

      detallesCreados.push(detalleFactura);
    }

    if (puntosDelta !== 0) {
      cliente.puntos += puntosDelta;
      if (cliente.puntos < 0) {
        throw new CustomError('El ajuste de puntos generó un saldo negativo', 500);
      }
      await cliente.save({ transaction });
    }

    await transaction.commit();

    const pdfBuffer = await generarPDFFactura(factura, pago, detallesCreados, cliente);

    return {
      factura,
      pago,
      detalles: detallesCreados,
      pdfBuffer,
    };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(`Error al confirmar el pago: ${error.message}`, 500);
  }
};

module.exports = {
  generarFactura,
  confirmarPago,
};
