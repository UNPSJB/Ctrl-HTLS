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
 * Función simple: Aplica un ajuste porcentual a un precio base.
 * @param {number} precioBase - El precio original.
 * @param {number} porcentaje - El porcentaje de ajuste (ej: 0.15 para +15%, -0.10 para -10%).
 * @returns {number} El precio final con el ajuste aplicado.
 */
export function calcSeasonalPrice(precioBase, porcentaje) {
  const base = toNumber(precioBase);
  const percent = toNumber(porcentaje);
  return roundToInteger(base * (1 + percent));
}

/**
 * Función principal: Calcula el precio total de una estancia, incluyendo noches y temporada.
 * Utiliza internamente a calcSeasonalPrice.
 */
export function calcRoomInstanceTotal({
  precio,
  porcentaje = 0,
  alquiler,
  limite,
}) {
  const pricePerNight = toNumber(precio);

  const totalNights = nightsBetween(alquiler?.fechaInicio, alquiler?.fechaFin, {
    useUTC: true,
  });
  const seasonalNights = limite ? calculateOverlapNights(alquiler, limite) : 0;
  const normalNights = totalNights - seasonalNights;

  const normalPriceTotal = pricePerNight * normalNights;

  // Calculamos el precio por noche con el ajuste de temporada
  const seasonalPricePerNight = calcSeasonalPrice(pricePerNight, porcentaje);
  const seasonalPriceTotal = seasonalPricePerNight * seasonalNights;

  const final = roundToInteger(normalPriceTotal + seasonalPriceTotal);
  const original = roundToInteger(pricePerNight * totalNights);
  const descuento = roundToInteger(original - final);

  // Devolvemos el objeto enriquecido
  return {
    original,
    final,
    descuento,
    nights: totalNights,
    pricePerNight: pricePerNight, // Precio base por noche
    seasonalPricePerNight: seasonalPricePerNight, // Precio por noche con temporada
    hasSeasonalAdjustment: seasonalNights > 0 && porcentaje !== 0,
  };
}

export function calcPackageTotal({ paquete, porcentaje = 0 }) {
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

  const final = calcSeasonalPrice(totalConDescuentoPaquete, porcentaje);
  const ajusteTemporadaMonto = final - totalConDescuentoPaquete;

  return {
    original: totalOriginal, // Precio total sin ningún descuento
    final, // Precio final con todos los ajustes
    sumPerNight: roundToInteger(sumPerNight),
    noches,
    descuentoPaqueteMonto,
    ajusteTemporadaMonto,
    descuentoPaquetePorcentaje: paquete.descuento, // El porcentaje crudo
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
        precio: inst.price,
        nights,
        qty,
        porcentaje: hotelSeasonDiscount,
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
      const { original, final } = calcPackageTotal({
        paquete: p,
        porcentaje: hotelSeasonDiscount,
        qty,
      });
      acc.original += original;
      acc.final += final;
      acc.descuento += original - final;
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

export function calcPackageBasePricePerNight(paquete) {
  const sum = Array.isArray(paquete?.habitaciones)
    ? paquete.habitaciones.reduce(
        (acc, h) => acc + (toNumber(h?.precio) || 0),
        0
      )
    : 0;

  return roundToInteger(sum);
}

export function calcCartTotal(hotelsSelections = []) {
  let originalSum = 0;
  let finalSum = 0;

  hotelsSelections.forEach((entry) => {
    const hotelSeasonDiscount = entry.hotel?.temporada?.porcentaje ?? 0;

    (entry.hotel.habitaciones || []).forEach((room) => {
      const nights = nightsBetween(room.fechaInicio, room.fechaFin);
      const calc = calcRoomInstanceTotal({
        precio: room.precio,
        nights: nights,
        porcentaje: hotelSeasonDiscount,
      });
      originalSum += calc.original;
      finalSum += calc.final;
    });

    (entry.hotel.paquetes || []).forEach((pack) => {
      const calc = calcPackageTotal({
        paquete: pack,
        porcentaje: hotelSeasonDiscount,
      });
      originalSum += calc.original;
      finalSum += calc.final;
    });
  });

  const original = roundToInteger(originalSum);
  const final = roundToInteger(finalSum);
  const descuento = roundToInteger(original - final);

  return { original, final, descuento };
}

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
