const sequelize = require('../../config/database');
const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const Factura = require('../../models/ventas/Factura');
const DetalleFactura = require('../../models/ventas/DetalleFactura');
const Pago = require('../../models/ventas/Pago');
const Alquiler = require('../../models/ventas/Alquiler');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const AlquilerPaquetePromocional = require('../../models/ventas/AlquilerPaquetePromocional');
const Habitacion = require('../../models/hotel/Habitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const Hotel = require('../../models/hotel/Hotel');
const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const Cliente = require('../../models/core/Cliente');
const Empleado = require('../../models/core/Empleado');
const Ciudad = require('../../models/core/Ciudad');
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
    throw new CustomError(
      'Debe indicar al menos un alquiler para facturar',
      400,
    );
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

  if (
    Number(totalDetalles.toFixed(2)) !== Number(Number(montoTotal).toFixed(2))
  ) {
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
    throw new CustomError(
      'Los montos de efectivo o tarjeta no son válidos',
      400,
    );
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
    } else if (tipoPagoNormalizado === 'Mixto') {
      const puntosGanados = Math.floor(efectivo / 5);
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

    // Crear fecha local al inicio del día para evitar conversión a UTC
    const now = new Date();
    const fechaLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );

    const factura = await Factura.create(
      {
        fecha: fechaLocal,
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

      const [habitacionesRel, cantPaquetes] = await Promise.all([
        AlquilerHabitacion.findAll({
          where: { alquilerId: alquilerRelacionado.id },
          attributes: ['habitacionId'],
          transaction,
        }),
        AlquilerPaquetePromocional.count({
          where: { alquilerId: alquilerRelacionado.id },
          transaction,
        }),
      ]);

      const partesDescripcion = [];

      if (habitacionesRel.length > 0) {
        const habitacionIds = habitacionesRel.map((hr) => hr.habitacionId);
        const habitaciones = await Habitacion.findAll({
          where: { id: habitacionIds },
          include: [
            {
              model: TipoHabitacion,
              as: 'tipoHabitacion',
              attributes: ['nombre'],
            },
          ],
          transaction,
        });

        const conteoTipos = {};
        habitaciones.forEach((h) => {
          const tipoNombre = h.tipoHabitacion?.nombre || 'estándar';
          conteoTipos[tipoNombre] = (conteoTipos[tipoNombre] || 0) + 1;
        });

        Object.entries(conteoTipos).forEach(([tipo, cant]) => {
          const tipoLower = tipo.toLowerCase();
          const tipoPlural =
            cant > 1 && !tipoLower.endsWith('s') ? tipoLower + 's' : tipoLower;
          partesDescripcion.push(
            `${cant} habitaci${cant === 1 ? 'ón' : 'ones'} ${tipoPlural}`,
          );
        });
      }

      if (cantPaquetes > 0) {
        partesDescripcion.push(
          `${cantPaquetes} paquete${cantPaquetes === 1 ? '' : 's'}`,
        );
      }

      const descripcionGenerada = partesDescripcion.length
        ? partesDescripcion.join(', ')
        : `Alquiler #${alquilerRelacionado.id}`;

      const detalleFactura = await DetalleFactura.create(
        {
          facturaId: factura.id,
          alquilerId: alquilerRelacionado.id,
          empleadoId: vendedorId,
          subtotal: detalle.subTotal,
          precio_unitario: detalle.subTotal,
          descripcion: detalle.descripcion || descripcionGenerada,
        },
        { transaction },
      );

      detallesCreados.push(detalleFactura);
    }

    if (puntosDelta !== 0) {
      cliente.puntos += puntosDelta;
      if (cliente.puntos < 0) {
        throw new CustomError(
          'El ajuste de puntos generó un saldo negativo',
          500,
        );
      }
      await cliente.save({ transaction });
    }

    await transaction.commit();

    const pdfBuffer = await generarPDFFactura(
      factura,
      pago,
      detallesCreados,
      cliente,
    );

    return {
      factura,
      pago,
      detalles: detallesCreados,
      puntos: cliente.puntos,
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

const obtenerVentasResumen = async () => {
  const ahora = new Date(); // Fecha y hora local

  // Rangos en zona horaria local
  const inicioDiaLocal = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    0,
    0,
    0,
    0,
  );
  const finDiaLocal = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    23,
    59,
    59,
    999,
  );

  // Convertir rangos locales a UTC para comparar con la base de datos
  const inicioDia = new Date(
    inicioDiaLocal.getTime() - inicioDiaLocal.getTimezoneOffset() * 60000,
  );
  const finDia = new Date(
    finDiaLocal.getTime() - finDiaLocal.getTimezoneOffset() * 60000,
  );

  const distanciaLunes = (ahora.getDay() + 6) % 7;
  const inicioSemanaLocal = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - distanciaLunes,
    0,
    0,
    0,
    0,
  );
  const finSemanaLocal = new Date(
    inicioSemanaLocal.getFullYear(),
    inicioSemanaLocal.getMonth(),
    inicioSemanaLocal.getDate() + 6,
    23,
    59,
    59,
    999,
  );

  const inicioSemana = new Date(
    inicioSemanaLocal.getTime() - inicioSemanaLocal.getTimezoneOffset() * 60000,
  );
  const finSemana = new Date(
    finSemanaLocal.getTime() - finSemanaLocal.getTimezoneOffset() * 60000,
  );

  const inicioMesLocal = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const finMesLocal = new Date(
    ahora.getFullYear(),
    ahora.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const inicioMes = new Date(
    inicioMesLocal.getTime() - inicioMesLocal.getTimezoneOffset() * 60000,
  );
  const finMes = new Date(
    finMesLocal.getTime() - finMesLocal.getTimezoneOffset() * 60000,
  );

  const [facturasDia, facturasSemana, facturasMes] = await Promise.all([
    Factura.findAll({
      where: {
        fecha: {
          [Op.gte]: inicioDia,
          [Op.lte]: finDia,
        },
      },
      attributes: ['importe_total'],
    }),
    Factura.findAll({
      where: {
        fecha: {
          [Op.gte]: inicioSemana,
          [Op.lte]: finSemana,
        },
      },
      attributes: ['importe_total'],
    }),
    Factura.findAll({
      where: {
        fecha: {
          [Op.gte]: inicioMes,
          [Op.lte]: finMes,
        },
      },
      attributes: ['importe_total'],
    }),
  ]);

  const calcular = (facturas) => ({
    cantidad: facturas.length,
    total: facturas.reduce((sum, f) => sum + Number(f.importe_total), 0),
  });

  return {
    dia: calcular(facturasDia),
    semana: calcular(facturasSemana),
    mes: calcular(facturasMes),
  };
};

const obtenerPDFFactura = async (facturaId) => {
  const idNumerico = Number(facturaId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id de la factura no es válido', 400);
  }

  const factura = await Factura.findByPk(idNumerico, {
    include: [
      {
        model: Pago,
        as: 'pago',
      },
    ],
  });

  if (!factura) {
    throw new CustomError('Factura no encontrada', 404);
  }

  const detalles = await DetalleFactura.findAll({
    where: { facturaId: idNumerico },
  });

  if (detalles.length === 0) {
    throw new CustomError('La factura no tiene detalles', 404);
  }

  const alquilerId = detalles[0].alquilerId;
  const alquiler = await Alquiler.findByPk(alquilerId, {
    include: [
      {
        model: Cliente,
        as: 'cliente',
      },
    ],
  });

  if (!alquiler || !alquiler.cliente) {
    throw new CustomError('No se encontró el cliente de la factura', 404);
  }

  const pdfBuffer = await generarPDFFactura(
    factura,
    factura.pago,
    detalles,
    alquiler.cliente,
  );

  return pdfBuffer;
};

const buscarVentas = async (filtros) => {
  const { fechaInicio, fechaFin, dniCliente, dniVendedor, nombreHotel } =
    filtros;

  const tieneAlgunFiltro =
    fechaInicio || fechaFin || dniCliente || dniVendedor || nombreHotel;

  if (!tieneAlgunFiltro) {
    throw new CustomError('Debe ingresar al menos un filtro de búsqueda', 400);
  }

  // Construir condiciones de fecha sobre Factura
  const whereFactura = {};
  if (fechaInicio && fechaFin) {
    const [startYear, startMonth, startDay] = fechaInicio
      .split('-')
      .map(Number);
    const [endYear, endMonth, endDay] = fechaFin.split('-').map(Number);
    whereFactura.fecha = {
      [Op.gte]: new Date(startYear, startMonth - 1, startDay, 0, 0, 0),
      [Op.lte]: new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999),
    };
  } else if (fechaInicio) {
    const [year, month, day] = fechaInicio.split('-').map(Number);
    whereFactura.fecha = {
      [Op.gte]: new Date(year, month - 1, day, 0, 0, 0),
    };
  } else if (fechaFin) {
    const [year, month, day] = fechaFin.split('-').map(Number);
    whereFactura.fecha = {
      [Op.lte]: new Date(year, month - 1, day, 23, 59, 59, 999),
    };
  }

  // Filtrar por vendedor (DNI)
  let empleadoIds = null;
  if (dniVendedor) {
    const empleados = await Empleado.findAll({
      where: { numeroDocumento: dniVendedor },
      attributes: ['id'],
      raw: true,
    });
    if (empleados.length === 0) {
      return [];
    }
    empleadoIds = empleados.map((e) => e.id);
  }

  // Filtrar por cliente (DNI)
  let clienteIds = null;
  if (dniCliente) {
    const clientes = await Cliente.findAll({
      where: { numeroDocumento: dniCliente },
      attributes: ['id'],
      raw: true,
    });
    if (clientes.length === 0) {
      return [];
    }
    clienteIds = clientes.map((c) => c.id);
  }

  // Filtrar por hotel (nombre)
  let alquilerIdsPorHotel = null;
  if (nombreHotel) {
    const nombreNormalizado = nombreHotel.trim().toLowerCase();
    const hoteles = await Hotel.findAll({
      where: { nombre: { [Op.like]: `%${nombreNormalizado}%` } },
      attributes: ['id'],
      raw: true,
    });

    if (hoteles.length === 0) {
      return [];
    }

    const hotelIds = hoteles.map((h) => h.id);

    // Buscar habitaciones de esos hoteles
    const habitaciones = await Habitacion.findAll({
      where: { hotelId: { [Op.in]: hotelIds } },
      attributes: ['id'],
      raw: true,
    });
    const habitacionIds = habitaciones.map((h) => h.id);

    // Buscar paquetes de esos hoteles
    const paquetes = await PaquetePromocional.findAll({
      where: { hotelId: { [Op.in]: hotelIds } },
      attributes: ['id'],
      raw: true,
    });
    const paqueteIds = paquetes.map((p) => p.id);

    // Obtener alquileres relacionados
    const alquileresHab =
      habitacionIds.length > 0
        ? await AlquilerHabitacion.findAll({
            where: { habitacionId: { [Op.in]: habitacionIds } },
            attributes: ['alquilerId'],
            raw: true,
          })
        : [];

    const alquileresPaq =
      paqueteIds.length > 0
        ? await AlquilerPaquetePromocional.findAll({
            where: { paquetePromocionalId: { [Op.in]: paqueteIds } },
            attributes: ['alquilerId'],
            raw: true,
          })
        : [];

    alquilerIdsPorHotel = [
      ...new Set([
        ...alquileresHab.map((a) => a.alquilerId),
        ...alquileresPaq.map((a) => a.alquilerId),
      ]),
    ];

    if (alquilerIdsPorHotel.length === 0) {
      return [];
    }
  }

  // Construir condiciones para DetalleFactura
  const whereDetalle = {};
  if (empleadoIds) {
    whereDetalle.empleadoId = { [Op.in]: empleadoIds };
  }

  // Si hay filtro por cliente, obtener alquileres de esos clientes
  let alquilerIdsPorCliente = null;
  if (clienteIds) {
    const alquileresCliente = await Alquiler.findAll({
      where: { clienteId: { [Op.in]: clienteIds } },
      attributes: ['id'],
      raw: true,
    });
    if (alquileresCliente.length === 0) {
      return [];
    }
    alquilerIdsPorCliente = alquileresCliente.map((a) => a.id);
  }

  // Combinar filtros de alquilerId (hotel + cliente)
  if (alquilerIdsPorHotel && alquilerIdsPorCliente) {
    const interseccion = alquilerIdsPorHotel.filter((id) =>
      alquilerIdsPorCliente.includes(id),
    );
    if (interseccion.length === 0) {
      return [];
    }
    whereDetalle.alquilerId = { [Op.in]: interseccion };
  } else if (alquilerIdsPorHotel) {
    whereDetalle.alquilerId = { [Op.in]: alquilerIdsPorHotel };
  } else if (alquilerIdsPorCliente) {
    whereDetalle.alquilerId = { [Op.in]: alquilerIdsPorCliente };
  }

  // Buscar detalles con las relaciones necesarias
  const detalles = await DetalleFactura.findAll({
    where: whereDetalle,
    include: [
      {
        model: Factura,
        as: 'factura',
        where: Object.keys(whereFactura).length > 0 ? whereFactura : undefined,
        include: [
          {
            model: Pago,
            as: 'pago',
            attributes: ['tipo_pago'],
          },
        ],
        attributes: ['id', 'fecha', 'numero', 'tipo_factura', 'importe_total'],
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
    order: [[{ model: Factura, as: 'factura' }, 'numero', 'DESC']],
  });

  // Obtener alquilerIds de los detalles para resolver hotel
  const alquilerIdsDetalles = [
    ...new Set(detalles.map((d) => d.alquilerId).filter(Boolean)),
  ];

  // Resolver hotel por habitaciones
  const alquileresHabInfo =
    alquilerIdsDetalles.length > 0
      ? await AlquilerHabitacion.findAll({
          where: { alquilerId: { [Op.in]: alquilerIdsDetalles } },
          attributes: ['alquilerId', 'habitacionId'],
          raw: true,
        })
      : [];
  const habIds = [...new Set(alquileresHabInfo.map((ah) => ah.habitacionId))];
  const habsConHotel =
    habIds.length > 0
      ? await Habitacion.findAll({
          where: { id: { [Op.in]: habIds } },
          include: [{ model: Hotel, as: 'hotel', attributes: ['nombre'] }],
          attributes: ['id'],
        })
      : [];
  const hotelPorHab = {};
  habsConHotel.forEach((h) => {
    hotelPorHab[h.id] = h.hotel?.nombre || null;
  });
  const hotelPorAlqHab = {};
  alquileresHabInfo.forEach((ah) => {
    if (hotelPorHab[ah.habitacionId]) {
      hotelPorAlqHab[ah.alquilerId] = hotelPorHab[ah.habitacionId];
    }
  });

  // Resolver hotel por paquetes promocionales
  const alqPaqInfo =
    alquilerIdsDetalles.length > 0
      ? await AlquilerPaquetePromocional.findAll({
          where: { alquilerId: { [Op.in]: alquilerIdsDetalles } },
          attributes: ['alquilerId', 'paquetePromocionalId'],
          raw: true,
        })
      : [];
  const paqIds = [...new Set(alqPaqInfo.map((ap) => ap.paquetePromocionalId))];
  const paqsConHotel =
    paqIds.length > 0
      ? await PaquetePromocional.findAll({
          where: { id: { [Op.in]: paqIds } },
          include: [{ model: Hotel, as: 'hotel', attributes: ['nombre'] }],
          attributes: ['id'],
        })
      : [];
  const hotelPorPaq = {};
  paqsConHotel.forEach((p) => {
    hotelPorPaq[p.id] = p.hotel?.nombre || null;
  });
  const hotelPorAlqPaq = {};
  alqPaqInfo.forEach((ap) => {
    if (hotelPorPaq[ap.paquetePromocionalId]) {
      hotelPorAlqPaq[ap.alquilerId] = hotelPorPaq[ap.paquetePromocionalId];
    }
  });

  // Agrupar por factura para evitar duplicados
  const ventasPorFactura = {};
  for (const detalle of detalles) {
    const factura = detalle.factura;
    if (!factura) continue;

    const fId = factura.id;
    if (!ventasPorFactura[fId]) {
      const empleado = detalle.empleado;
      const cliente = detalle.alquiler ? detalle.alquiler.cliente : null;
      const alqId = detalle.alquilerId;
      const hotel = hotelPorAlqHab[alqId] || hotelPorAlqPaq[alqId] || null;

      ventasPorFactura[fId] = {
        facturaId: factura.id,
        numeroFactura: factura.numero,
        tipoFactura: factura.tipo_factura,
        fecha: factura.fecha
          ? new Date(factura.fecha).toISOString().split('T')[0]
          : null,
        vendedor: empleado
          ? { nombre: empleado.nombre, apellido: empleado.apellido }
          : null,
        cliente: cliente
          ? { nombre: cliente.nombre, apellido: cliente.apellido }
          : null,
        hotel,
        montoTotal: Number(factura.importe_total),
        metodoDePago: factura.pago ? factura.pago.tipo_pago : null,
      };
    }
  }

  return Object.values(ventasPorFactura);
};

const obtenerDetalleFactura = async (facturaId) => {
  const idNumerico = Number(facturaId);
  if (Number.isNaN(idNumerico) || idNumerico <= 0) {
    throw new CustomError('El id de la factura no es válido', 400);
  }

  const factura = await Factura.findByPk(idNumerico, {
    include: [
      {
        model: Pago,
        as: 'pago',
        attributes: ['tipo_pago'],
      },
    ],
  });

  if (!factura) {
    throw new CustomError('Factura no encontrada', 404);
  }

  // Obtener detalles de la factura
  const detalles = await DetalleFactura.findAll({
    where: { facturaId: idNumerico },
    include: [
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
          {
            model: Habitacion,
            as: 'habitaciones',
            include: [
              {
                model: TipoHabitacion,
                as: 'tipoHabitacion',
                attributes: ['nombre'],
              },
              {
                model: Hotel,
                as: 'hotel',
                include: [
                  {
                    model: Ciudad,
                    as: 'ciudad',
                    attributes: ['nombre'],
                  },
                ],
                attributes: ['id', 'nombre'],
              },
            ],
            attributes: ['id', 'numero'],
          },
          {
            model: PaquetePromocional,
            as: 'paquetesPromocionales',
            include: [
              {
                model: Habitacion,
                as: 'habitaciones',
                attributes: ['id', 'numero', 'tipoHabitacionId', 'hotelId'],
                include: [
                  {
                    model: TipoHabitacion,
                    as: 'tipoHabitacion',
                  },
                ],
              },
              {
                model: Hotel,
                as: 'hotel',
                include: [
                  {
                    model: Ciudad,
                    as: 'ciudad',
                    attributes: ['nombre'],
                  },
                ],
                attributes: ['id', 'nombre'],
              },
            ],
            attributes: ['id', 'nombre', 'fecha_inicio', 'fecha_fin'],
          },
        ],
        attributes: ['id', 'fecha_inicio', 'fecha_fin', 'pasajeros'],
      },
    ],
  });

  if (detalles.length === 0) {
    throw new CustomError('La factura no tiene detalles', 404);
  }

  // Resolver vendedor y cliente del primer detalle
  const primerDetalle = detalles[0];
  const empleado = primerDetalle.empleado;
  const primerAlquiler = primerDetalle.alquiler;
  const cliente = primerAlquiler ? primerAlquiler.cliente : null;

  // Iterar todos los detalles para agregar habitaciones, paquetes y resolver hotel
  let hotelInfo = null;
  const habitaciones = [];
  const paquetes = [];
  let alquilerInfo = null;

  for (const detalle of detalles) {
    const alquiler = detalle.alquiler;
    if (!alquiler) continue;

    // Tomar datos del alquiler con mayor rango (o el primero encontrado)
    if (!alquilerInfo) {
      alquilerInfo = {
        fechaInicio: alquiler.fecha_inicio,
        fechaFin: alquiler.fecha_fin,
        pasajeros: alquiler.pasajeros,
      };
    }

    // Agregar habitaciones de este alquiler
    if (alquiler.habitaciones && alquiler.habitaciones.length > 0) {
      for (const h of alquiler.habitaciones) {
        habitaciones.push({
          numero: h.numero,
          tipoHabitacion: h.tipoHabitacion ? h.tipoHabitacion.nombre : null,
        });

        // Resolver hotel desde la habitación
        if (!hotelInfo && h.hotel) {
          hotelInfo = {
            id: h.hotel.id,
            nombre: h.hotel.nombre,
            localidad: h.hotel.ciudad ? h.hotel.ciudad.nombre : null,
          };
        }
      }
    }

    // Agregar paquetes de este alquiler
    if (
      alquiler.paquetesPromocionales &&
      alquiler.paquetesPromocionales.length > 0
    ) {
      for (const paq of alquiler.paquetesPromocionales) {
        paquetes.push({
          nombre: paq.nombre,
          fechaInicio: paq.fecha_inicio,
          fechaFin: paq.fecha_fin,
          habitaciones: paq.habitaciones
            ? paq.habitaciones.map((h) => {
                const tipo = h.dataValues.tipoHabitacion;
                console.log();

                return {
                  numero: h.numero,
                  tipoHabitacion: tipo ? tipo.dataValues.nomb : null,
                };
              })
            : [],
        });

        // Resolver hotel desde el paquete
        if (!hotelInfo && paq.hotel) {
          hotelInfo = {
            id: paq.hotel.id,
            nombre: paq.hotel.nombre,
            localidad: paq.hotel.ciudad ? paq.hotel.ciudad.nombre : null,
          };
        }
      }
    }
  }

  return {
    hotel: hotelInfo,
    cliente: cliente
      ? { nombre: cliente.nombre, apellido: cliente.apellido }
      : null,
    vendedor: empleado
      ? { nombre: empleado.nombre, apellido: empleado.apellido }
      : null,
    factura: {
      numero: factura.numero,
      fecha: factura.fecha,
      tipo: factura.tipo_factura,
      montoTotal: Number(factura.importe_total),
      metodoDePago: factura.pago ? factura.pago.tipo_pago : null,
    },
    alquiler: alquilerInfo,
    habitaciones,
    paquetes,
  };
};

module.exports = {
  generarFactura,
  confirmarPago,
  obtenerVentasResumen,
  obtenerPDFFactura,
  buscarVentas,
  obtenerDetalleFactura,
};
