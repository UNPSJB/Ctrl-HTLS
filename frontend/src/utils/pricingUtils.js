import dateUtils from './dateUtils';

const { nightsBetween, calculateOverlapNights } = dateUtils;

export function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function roundToInteger(n) {
  return Math.round(toNumber(n));
}

export function roundTwo(n) {
  return Math.round(toNumber(n) * 100) / 100;
}

export function normalizeDiscount(v) {
  const n = toNumber(v);
  if (n <= 0) return 0;
  if (n > 0 && n < 1) return n;
  if (n >= 1 && n <= 100) return n / 100;
  return 1;
}

/**
 * Aplica el ajuste de temporada a un precio base.
 * Si la temporada es 'baja', resta el porcentaje (descuento).
 * Si la temporada es 'alta' o cualquier otro caso, suma el porcentaje (recargo).
 * @param {number} precioBase - El precio original.
 * @param {object|null} temporada - Objeto { tipo, porcentaje, fechaInicio, fechaFin }.
 * @returns {number} El precio final con el ajuste aplicado.
 */
export function calcSeasonalPrice(precioBase, temporada) {
  const base = toNumber(precioBase);
  const percent = toNumber(temporada?.porcentaje);
  if (temporada?.tipo === 'baja') {
    return roundToInteger(base * (1 - percent));
  }
  return roundToInteger(base * (1 + percent));
}

/**
 * Función principal: Calcula el precio total de una estancia, incluyendo noches y temporada.
 * Utiliza internamente a calcSeasonalPrice.
 */
/**
 * Calcula el precio total de una estancia, incluyendo noches y temporada.
 * @param {object} params
 * @param {number} params.precio - Precio por noche.
 * @param {object|null} params.temporada - Objeto de temporada { tipo, porcentaje, fechaInicio, fechaFin }.
 * @param {object} params.alquiler - Rango de fechas del alquiler { fechaInicio, fechaFin }.
 */
export function calcRoomInstanceTotal({
  precio,
  temporada = null,
  alquiler,
}) {
  const pricePerNight = toNumber(precio);

  const totalNights = nightsBetween(alquiler?.fechaInicio, alquiler?.fechaFin, {
    useUTC: true,
  });
  const seasonalNights = temporada ? calculateOverlapNights(alquiler, temporada) : 0;
  const normalNights = totalNights - seasonalNights;

  const normalPriceTotal = pricePerNight * normalNights;

  // Calculamos el precio por noche con el ajuste de temporada (alta sube, baja baja)
  const seasonalPricePerNight = calcSeasonalPrice(pricePerNight, temporada);
  const seasonalPriceTotal = seasonalPricePerNight * seasonalNights;

  const final = roundToInteger(normalPriceTotal + seasonalPriceTotal);
  const original = roundToInteger(pricePerNight * totalNights);
  const descuento = roundToInteger(original - final);

  return {
    original,
    final,
    descuento,
    nights: totalNights,
    pricePerNight,
    seasonalPricePerNight,
    hasSeasonalAdjustment: seasonalNights > 0 && toNumber(temporada?.porcentaje) !== 0,
  };
}

/**
 * Calcula el total de un paquete turístico con descuento propio + ajuste de temporada.
 * @param {object} params
 * @param {object} params.paquete - Datos del paquete.
 * @param {object|null} params.temporada - Objeto de temporada { tipo, porcentaje, ... }.
 */
export function calcPackageTotal({ paquete, temporada = null }) {
  const habitaciones = Array.isArray(paquete.habitaciones)
    ? paquete.habitaciones
    : [];
  const noches = paquete.noches || 1;
  const sumPerNight = habitaciones.reduce(
    (acc, h) => acc + toNumber(h.precio),
    0
  );

  const totalOriginal = roundToInteger(sumPerNight * noches);

  const descuentoPaquetePorcentaje = normalizeDiscount(paquete.descuento);
  const descuentoPaqueteMonto = roundToInteger(
    totalOriginal * descuentoPaquetePorcentaje
  );
  const totalConDescuentoPaquete = totalOriginal - descuentoPaqueteMonto;

  const final = calcSeasonalPrice(totalConDescuentoPaquete, temporada);
  const ajusteTemporadaMonto = final - totalConDescuentoPaquete;

  return {
    original: totalOriginal,
    final,
    sumPerNight: roundToInteger(sumPerNight),
    noches,
    descuentoPaqueteMonto,
    ajusteTemporadaMonto,
    descuentoPaquetePorcentaje: paquete.descuento,
  };
}

// --- Las funciones de aquí en adelante no necesitan cambios ---

export function getRoomTypesFromHotel(hotel) {
  if (!hotel || !Array.isArray(hotel.habitaciones)) return [];

  return hotel.habitaciones.flatMap((typeObj) => {
    const precio = toNumber(typeObj.precio);
    const capacidad = toNumber(typeObj.capacidad);

    return Object.keys(typeObj)
      .filter((k) => Array.isArray(typeObj[k]))
      .map((typeName) => ({
        typeName,
        price: precio,
        capacity: capacidad,
        instances: Array.isArray(typeObj[typeName]) ? typeObj[typeName] : [],
      }));
  });
}

export function flattenRoomInstances(hotel) {
  const types = getRoomTypesFromHotel(hotel);
  const out = [];
  types.forEach((t) => {
    t.instances.forEach((inst) => {
      out.push({
        id: inst.id,
        typeName: t.typeName,
        price: t.price,
        capacity: t.capacity,
        ...inst,
      });
    });
  });
  return out;
}



export function calcPackageBasePricePerNight(paquete) {
  const sum = Array.isArray(paquete?.habitaciones)
    ? paquete.habitaciones.reduce(
        (acc, h) => acc + (toNumber(h?.precio) || 0),
        0
      )
    : 0;

  return roundToInteger(sum);
}



export function normalizeHotelForBooking(hotelOriginal) {
  if (!hotelOriginal) return null;

  const hotelId = hotelOriginal.hotelId;
  const nombre = hotelOriginal.nombre || '';
  const temporada = hotelOriginal.temporada ?? null;

  const roomTypes = getRoomTypesFromHotel(hotelOriginal);
  const instances = flattenRoomInstances(hotelOriginal);

  const paquetes = Array.isArray(hotelOriginal.paquetes)
    ? hotelOriginal.paquetes.map((p) => ({
        ...p,
        noches: Math.max(1, Math.floor(toNumber(p.noches || 1))),
        descuento: normalizeDiscount(p.descuento),
      }))
    : [];

  const descuentos = Array.isArray(hotelOriginal.descuentos)
    ? hotelOriginal.descuentos
    : [];

  return {
    hotelId,
    nombre,
    temporada,
    roomTypes,
    instances,
    paquetes,
    descuentos,
    raw: hotelOriginal,
  };
}

/**
 * Calcula el descuento aplicable por cantidad EXACTA de habitaciones.
 * El descuento solo aplica si la cantidad de habitaciones coincide exactamente
 * con algún descuento configurado para el hotel.
 * @param {number} cantidadHabitaciones - Cantidad total de habitaciones en el carrito.
 * @param {Array} descuentos - Array de descuentos del hotel [{porcentaje, cantidad_de_habitaciones}].
 * @param {number} totalConTemporada - Monto total de las habitaciones después de aplicar temporada.
 * @returns {{ montoDescuento: number, porcentajeAplicado: number }}
 */
export function calcDescuentoPorCantidad(cantidadHabitaciones, descuentos, totalConTemporada) {
  if (!Array.isArray(descuentos) || descuentos.length === 0 || cantidadHabitaciones <= 0) {
    return { montoDescuento: 0, porcentajeAplicado: 0 };
  }

  // Buscar coincidencia exacta de cantidad
  const descuentoAplicable = descuentos.find(
    (d) => d.cantidad_de_habitaciones === cantidadHabitaciones
  );

  if (!descuentoAplicable) {
    return { montoDescuento: 0, porcentajeAplicado: 0 };
  }

  const porcentaje = toNumber(descuentoAplicable.porcentaje);
  const montoDescuento = roundToInteger(totalConTemporada * porcentaje);

  return {
    montoDescuento,
    porcentajeAplicado: porcentaje,
  };
}

const DEFAULT = {
  toNumber,
  roundToInteger,
  roundTwo,
  normalizeDiscount,
  getRoomTypesFromHotel,
  flattenRoomInstances,
  calcRoomInstanceTotal,
  calcPackageTotal,
  normalizeHotelForBooking,
  calcPackageBasePricePerNight,
  calcSeasonalPrice,
  calcDescuentoPorCantidad,
};

export default Object.freeze(DEFAULT);
