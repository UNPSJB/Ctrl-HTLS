export function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Redondea a número entero. Útil para montos finales. */
export function roundToInteger(n) {
  return Math.round(toNumber(n));
}

/** Redondea a 2 decimales. Útil para cálculos intermedios de precisión. */
export function roundTwo(n) {
  return Math.round(toNumber(n) * 100) / 100;
}

/** Normaliza un valor de descuento a un decimal entre 0 y 1. */
export function normalizeDiscount(v) {
  const n = toNumber(v);
  if (n <= 0) return 0;
  if (n > 0 && n < 1) return n;
  if (n >= 1 && n <= 100) return n / 100;
  return 1;
}

/* Normalización de habitaciones */

/** Extrae tipos de habitación con price/capacity/instances del objeto hotel. */
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

/** Aplana las instancias de habitaciones a una lista única. */
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

/* Cálculo por instancia (habitaciones) */

/** Calcula el precio total final para una instancia de habitación. */
export function calcRoomInstanceTotal({
  roomInstance,
  nights = 1,
  qty = 1,
  hotelSeasonDiscount = 0,
}) {
  const pricePerNight = toNumber(roomInstance.price);
  const nightsNum = Math.max(1, Math.floor(toNumber(nights)));
  const qtyNum = Math.max(1, Math.floor(toNumber(qty)));

  const unitOriginal = roundTwo(pricePerNight * nightsNum);
  const totalOriginalIntermediate = roundTwo(unitOriginal * qtyNum);

  const hDisc = normalizeDiscount(hotelSeasonDiscount);
  const final = roundToInteger(totalOriginalIntermediate * (1 - hDisc));

  const totalOriginal = roundToInteger(totalOriginalIntermediate);
  const descuentoTotal = roundToInteger(totalOriginalIntermediate - final);

  return {
    original: totalOriginal,
    final,
    descuento: descuentoTotal,
    nights: nightsNum,
    qty: qtyNum,
  };
}

/* Paquetes */

/** Calcula el precio total final para un paquete. */
export function calcPackageTotal({
  paquete,
  hotelSeasonDiscount = 0,
  qty = 1,
}) {
  const habitaciones = Array.isArray(paquete.habitaciones)
    ? paquete.habitaciones
    : [];
  const sumPerNight = habitaciones.reduce(
    (acc, h) => acc + toNumber(h.precio),
    0
  );
  const nochesNum = Math.max(1, Math.floor(toNumber(paquete.noches)));
  const qtyNum = Math.max(1, Math.floor(toNumber(qty)));

  const originalPerPackage = roundTwo(sumPerNight * nochesNum);
  const originalTotalIntermediate = roundTwo(originalPerPackage * qtyNum);

  const packageDisc = normalizeDiscount(paquete.descuento);
  const afterPackageDisc = roundTwo(
    originalTotalIntermediate * (1 - packageDisc)
  );

  const hotelDisc = normalizeDiscount(hotelSeasonDiscount);
  const final = roundToInteger(afterPackageDisc * (1 - hotelDisc));

  const totalOriginal = roundToInteger(originalTotalIntermediate);
  const descuentoTotal = roundToInteger(originalTotalIntermediate - final);

  return {
    original: totalOriginal,
    final,
    descuento: descuentoTotal,
    noches: nochesNum,
    qty: qtyNum,
  };
}

/* Totales por hotel y carrito */

/** Calcula totales de un hotel según selección de instancias/paquetes. */
export function calcHotelTotalFromSelection(
  hotel,
  selectedInstanceIds = [],
  selectedPackageIds = [],
  options = {}
) {
  const {
    nightsByInstance = {},
    qtyByInstance = {},
    packageQtyMap = {},
  } = options;

  const hotelSeasonDiscount =
    hotel && hotel.temporada ? toNumber(hotel.temporada.porcentaje) : 0;

  const allInstances = flattenRoomInstances(hotel);

  const roomsTotal = selectedInstanceIds.reduce(
    (acc, id) => {
      const inst = allInstances.find((x) => x.id === id);
      if (!inst) return acc;
      const nights =
        nightsByInstance[id] !== undefined ? nightsByInstance[id] : 1;
      const qty = qtyByInstance[id] !== undefined ? qtyByInstance[id] : 1;
      const calc = calcRoomInstanceTotal({
        roomInstance: inst,
        nights,
        qty,
        hotelSeasonDiscount,
      });
      acc.original += calc.original;
      acc.final += calc.final;
      acc.descuento += calc.descuento;
      return acc;
    },
    { original: 0, final: 0, descuento: 0 }
  );

  const packages = Array.isArray(hotel.paquetes) ? hotel.paquetes : [];
  const packagesTotal = selectedPackageIds.reduce(
    (acc, pid) => {
      const p = packages.find((x) => x.id === pid);
      if (!p) return acc;
      const qty = packageQtyMap[pid] !== undefined ? packageQtyMap[pid] : 1;
      const calc = calcPackageTotal({ paquete: p, hotelSeasonDiscount, qty });
      acc.original += calc.original;
      acc.final += calc.final;
      acc.descuento += calc.descuento;
      return acc;
    },
    { original: 0, final: 0, descuento: 0 }
  );

  const original = roundToInteger(roomsTotal.original + packagesTotal.original);
  const final = roundToInteger(roomsTotal.final + packagesTotal.final);
  const descuento = roundToInteger(original - final);

  return {
    original,
    final,
    descuento,
    hotelId: hotel && hotel.hotelId !== undefined ? hotel.hotelId : null,
  };
}

/**
 * Calcula el precio base por noche de un paquete (la suma de los precios por noche de todas las habitaciones).
 * @param {object} paquete - El objeto paquete que contiene el array de habitaciones.
 * @returns {number} El precio base por noche, redondeado a un número entero.
 */
export function calcPackageBasePricePerNight(paquete) {
  // Aseguramos que toNumber y roundToInteger estén definidos aquí,
  // ya sea importándolos o asumiendo que están en el ámbito (si es que pricingUtils
  // no está usando módulos ESM puros). Usaremos los que ya definimos.

  // Usamos el 'toNumber' y 'roundToInteger' que ya existen en este módulo.
  const sum = Array.isArray(paquete?.habitaciones)
    ? paquete.habitaciones.reduce(
        (acc, h) => acc + (toNumber(h?.precio) || 0),
        0
      )
    : 0;

  return roundToInteger(sum);
}

/** Calcula totales del carrito (suma de varios hoteles). */
export function calcCartTotal(hotelsSelections = []) {
  const breakdown = [];
  let originalSum = 0;
  let finalSum = 0;

  hotelsSelections.forEach((entry) => {
    const {
      hotel,
      selectedInstanceIds = [],
      selectedPackageIds = [],
      options = {},
    } = entry;
    const res = calcHotelTotalFromSelection(
      hotel,
      selectedInstanceIds,
      selectedPackageIds,
      options
    );
    breakdown.push(res);
    originalSum += res.original;
    finalSum += res.final;
  });

  const original = roundToInteger(originalSum);
  const final = roundToInteger(finalSum);
  const descuento = roundToInteger(original - final);

  return { original, final, descuento, breakdown };
}

/* Normalizar hotel para booking (cacheable) */

/** Normaliza la estructura del hotel para uso en el frontend. */
export function normalizeHotelForBooking(hotelOriginal) {
  if (!hotelOriginal) return null;

  const hotelId = hotelOriginal.hotelId;
  const nombre = hotelOriginal.nombre || '';
  const temporadaPercent = hotelOriginal.temporada
    ? toNumber(hotelOriginal.temporada.porcentaje)
    : 0;

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
    temporadaPercent,
    roomTypes,
    instances,
    paquetes,
    descuentos,
    raw: hotelOriginal,
  };
}

/* Calcular el precio final por temporada alta, realizar el porcentaje de descuento del precio base */
export function calcSeasonalPrice(precioBase, porcentaje) {
  return roundToInteger(precioBase * (1 + porcentaje));
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
  calcHotelTotalFromSelection,
  calcCartTotal,
  normalizeHotelForBooking,
  calcPackageBasePricePerNight,
  calcSeasonalPrice,
};

export default Object.freeze(DEFAULT);
