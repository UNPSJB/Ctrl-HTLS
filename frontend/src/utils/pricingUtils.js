export function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Redondea a número entero (útil para cálculos internos de montos finales).
 * Usa Math.round: 0.5 o más hacia arriba, menos de 0.5 hacia abajo.
 * @param {number} n
 * @returns {number}
 */
export function roundToInteger(n) {
  return Math.round(toNumber(n));
}

/**
 * Redondea a 2 decimales (útil para cálculos intermedios que requieren precisión,
 * pero ya no se usa para el resultado final de un precio/monto).
 * @param {number} n
 * @returns {number}
 */
export function roundTwo(n) {
  return Math.round(toNumber(n) * 100) / 100;
}

/**
 * Normaliza un valor de descuento que puede venir como:
 * - "0.15" (decimal en string)
 * - 0.15 (decimal)
 * - "15" (porcentaje sin dividir)
 * Si el número está entre 0 y 1 lo devuelve tal cual; si está entre 1 y 100 lo considera porcentaje y lo divide por 100.
 * Resultado clamp 0..1.
 * @param {string|number} v
 * @returns {number} valor decimal entre 0 y 1
 */
export function normalizeDiscount(v) {
  const n = toNumber(v);
  if (n <= 0) return 0;
  if (n > 0 && n < 1) return n; // 0.15 => 0.15
  if (n >= 1 && n <= 100) return n / 100; // 15 => 0.15
  return 1; // valores absurdos => 100%
}

/**
 * Calcula noches entre startDate y endDate.
 * Si las fechas no son válidas o end <= start devuelve 1 (seguro por defecto).
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {number}
 */
export function calcNights(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (isNaN(s) || isNaN(e) || e <= s) return 1;
  const diffMs = e - s;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/* ============================
   Normalización de habitaciones
   ============================ */

/**
 * A partir de hotel.habitaciones devuelve una lista de tipos de habitación.
 * El JSON del hotel tiene elementos como:
 * {
 * "Deluxe": [ { id: 101, numero: 101, piso: 1 }, ... ],
 * "precio": 250,
 * "capacidad": 2
 * }
 *
 * Esta función detecta todas las claves cuyo valor es un array (las considera tipos)
 * y devuelve un objeto por cada tipo con price/capacity/instances.
 *
 * @param {Object} hotel
 * @returns {Array<{ typeName: string, price: number, capacity: number, instances: Array<object> }>}
 */
export function getRoomTypesFromHotel(hotel) {
  if (!hotel || !Array.isArray(hotel.habitaciones)) return [];

  return hotel.habitaciones.flatMap((typeObj) => {
    // precio y capacidad vienen como propiedades en el mismo objeto
    const precio = toNumber(typeObj.precio);
    const capacidad = toNumber(typeObj.capacidad);

    // todas las claves cuyo valor es array son consideradas "tipos"
    return Object.keys(typeObj)
      .filter((k) => Array.isArray(typeObj[k]))
      .map((typeName) => ({
        typeName,
        // El precio base por noche/unidad se mantiene como número (puede tener decimales)
        price: precio,
        capacity: capacidad,
        instances: Array.isArray(typeObj[typeName]) ? typeObj[typeName] : [],
      }));
  });
}

/**
 * Aplana las instancias de habitaciones a una lista por instancia.
 * Cada elemento devuelve: { id, typeName, price, capacity, ...instProps }
 *
 * @param {Object} hotel
 * @returns {Array<object>}
 */
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

/* ============================
   Cálculo por instancia (habitaciones)
   ============================ */

/**
 * Calcula el precio de una instancia de habitación:
 * - unitOriginal = price * nights (redondeado a 2 decimales para precisión)
 * - totalOriginal = unitOriginal * qty (redondeado a 2 decimales para precisión)
 * - final = totalOriginal * (1 - hotelSeasonDiscount) (redondeado a *entero*)
 *
 * Nota: hotelSeasonDiscount debe ser decimal (ej. 0.15) o se normaliza con normalizeDiscount.
 *
 * @param {Object} params
 * @param {object} params.roomInstance  instancia aplanada (tiene .price)
 * @param {number} [params.nights=1]
 * @param {number} [params.qty=1]
 * @param {number|string} [params.hotelSeasonDiscount=0] // toma el valor directamente de hotel.temporada.porcentaje si se pasa
 * @returns {{ original: number, final: number, descuento: number, nights: number, qty: number }}
 */
export function calcRoomInstanceTotal({
  roomInstance,
  nights = 1,
  qty = 1,
  hotelSeasonDiscount = 0,
}) {
  const pricePerNight = toNumber(roomInstance.price);
  const nightsNum = Math.max(1, Math.floor(toNumber(nights)));
  const qtyNum = Math.max(1, Math.floor(toNumber(qty)));

  // Cálculos intermedios con precisión de 2 decimales
  const unitOriginal = roundTwo(pricePerNight * nightsNum);
  const totalOriginalIntermediate = roundTwo(unitOriginal * qtyNum);

  const hDisc = normalizeDiscount(hotelSeasonDiscount);
  // El precio final se redondea al entero más cercano
  const final = roundToInteger(totalOriginalIntermediate * (1 - hDisc));

  // El original y el descuento también deben ser enteros para mantener la coherencia
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

/* ============================
   Paquetes
   ============================ */

/**
 * Calcula precio de un paquete:
 * - suma precios de paquete.habitaciones (campo precio) -> sumPerNight
 * - originalPerPackage = sumPerNight * paquete.noches (redondeado a 2 decimales para precisión)
 * - originalTotal = originalPerPackage * qty (redondeado a 2 decimales para precisión)
 * - aplica paquete.descuento
 * - luego aplica descuento de temporada del hotel
 * - el resultado final se redondea a *entero*
 *
 * @param {Object} params
 * @param {object} params.paquete   // objeto paquete tal cual viene en hotels.json
 * @param {number|string} [params.hotelSeasonDiscount=0] // se normaliza con normalizeDiscount
 * @param {number} [params.qty=1]
 * @returns {{ original: number, final: number, descuento: number, noches: number, qty: number }}
 */
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

  // Cálculos intermedios con precisión de 2 decimales
  const originalPerPackage = roundTwo(sumPerNight * nochesNum);
  const originalTotalIntermediate = roundTwo(originalPerPackage * qtyNum);

  const packageDisc = normalizeDiscount(paquete.descuento);
  const afterPackageDisc = roundTwo(
    originalTotalIntermediate * (1 - packageDisc)
  );

  const hotelDisc = normalizeDiscount(hotelSeasonDiscount);
  // El precio final se redondea al entero más cercano
  const final = roundToInteger(afterPackageDisc * (1 - hotelDisc));

  // El original y el descuento también deben ser enteros para mantener la coherencia
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

/* ============================
   Totales por hotel y carrito
   ============================ */

/**
 * Calcula totales de un hotel según selección.
 * - hotel: objeto tal cual del JSON (usa hotel.temporada?.porcentaje para descuento de temporada)
 * - selectedInstanceIds: array de ids de instancias seleccionadas (ej: [101, 102])
 * - selectedPackageIds: array de ids de paquetes seleccionados (ej: ['p1', 'p2'])
 * - options: permite pasar nightsByInstance (obj id->nights), qtyByInstance (obj id->qty),
 * packageQtyMap (obj packageId->qty)
 *
 * Devuelve { original, final, descuento, hotelId }
 *
 * @param {Object} hotel
 * @param {Array<number|string>} selectedInstanceIds
 * @param {Array<number|string>} selectedPackageIds
 * @param {Object} [options]
 */
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

  // Tomamos el descuento de temporada exactamente desde hotel.temporada.porcentaje
  const hotelSeasonDiscount =
    hotel && hotel.temporada ? toNumber(hotel.temporada.porcentaje) : 0;

  const allInstances = flattenRoomInstances(hotel);

  // Sumar habitaciones seleccionadas
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

  // Sumar paquetes seleccionados
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

  // Los totales del hotel también se redondean al sumar los componentes
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
 * Calcula totales del carrito (varios hoteles). Recibe un array con objetos:
 * { hotel, selectedInstanceIds, selectedPackageIds, options }
 *
 * Devuelve { original, final, descuento, breakdown: [ { hotelId, original, final, descuento } ] }
 *
 * @param {Array<Object>} hotelsSelections
 */
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

  // Los totales del carrito también se redondean al sumar los componentes
  const original = roundToInteger(originalSum);
  const final = roundToInteger(finalSum);
  const descuento = roundToInteger(original - final);

  return { original, final, descuento, breakdown };
}

/* ============================
   Utilidad: normalizar hotel para booking (cacheable)
   ============================ */

/**
 * Normaliza un hotel para uso en el frontend:
 * - parsea valores numéricos
 * - extrae tipos de habitación y instancias a estructuras útiles
 * - deja paquetes tal cual pero parseando descuento y noches
 *
 * Útil para ejecutar una vez al cargar el JSON y luego trabajar con la estructura resultante.
 *
 * @param {Object} hotelOriginal
 * @returns {Object} hotel normalizado
 */
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

  // descuentos (reglas por cantidad) se mantienen tal cual; no los interpretamos automáticamente
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
    raw: hotelOriginal, // referencia al original por si hace falta
  };
}

/* ============================
   Export default (congelado)
   ============================ */

const DEFAULT = {
  toNumber,
  roundToInteger, // Nueva función exportada
  roundTwo,
  normalizeDiscount,
  calcNights,
  getRoomTypesFromHotel,
  flattenRoomInstances,
  calcRoomInstanceTotal,
  calcPackageTotal,
  calcHotelTotalFromSelection,
  calcCartTotal,
  normalizeHotelForBooking,
};

export default Object.freeze(DEFAULT);

/* ============================
   Ejemplo de uso (comentado)
   ============================
import hotels from './data/hotels.json';
import pricingUtils from './utils/pricingUtils';

// Normalizar un hotel
const hotel = normalizeHotelForBooking(hotels[0]);

// Selección ejemplo
const selectedInstanceIds = [101, 102];
const selectedPackageIds = [1];

// Cálculo por hotel
const totals = calcHotelTotalFromSelection(hotel.raw, selectedInstanceIds, selectedPackageIds);

// Cálculo carrito
const cart = calcCartTotal([
  { hotel: hotels[0], selectedInstanceIds: [101], selectedPackageIds: [1] },
  { hotel: hotels[1], selectedInstanceIds: [201], selectedPackageIds: [] }
]);
================================ */
