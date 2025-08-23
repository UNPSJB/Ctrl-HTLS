// src/utils/pricingUtils.js
// Comentarios en español; nombres de funciones en inglés (para imports limpios).

/* ============================
   Helpers internos
   ============================ */

/** roundTwo(n) -> redondea a 2 decimales */
export function roundTwo(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

/** toNumber(v) -> normaliza a Number seguro */
export function toNumber(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** calcNights(startDate, endDate) -> devuelve al menos 1 noche */
export function calcNights(startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()))
      return 1;
    // Si end < start, mantenemos 1 noche por seguridad (en vez de usar Math.abs)
    if (end <= start) return 1;
    const diffMs = end - start;
    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  } catch {
    return 1;
  }
}

/** normalizeDiscount(v) -> convierte 10 -> 0.1 y limita entre 0 y 1 */
export function normalizeDiscount(v) {
  let d = toNumber(v ?? 0);
  if (d > 1) d = d / 100;
  d = Math.min(Math.max(d, 0), 1);
  return d;
}

/* ============================
   Habitaciones (rooms)
   ============================ */

/**
 * calcRoomBase(room)
 * - Devuelve: { unitOriginal, totalOriginal, nights, qty }
 */
export function calcRoomBase(room = {}) {
  const price = toNumber(room.precio ?? room.price);
  const nights = calcNights(
    room.fechaInicio ?? room.startDate,
    room.fechaFin ?? room.endDate
  );
  const qty = Math.max(1, Math.floor(toNumber(room.qty ?? room.quantity ?? 1)));
  const unitOriginal = roundTwo(price * nights);
  const totalOriginal = roundTwo(unitOriginal * qty);
  return { unitOriginal, totalOriginal, nights, qty };
}

/**
 * calcRoomFinal({ room, hotelDiscount = 0 })
 * - Aplica descuento del hotel (hotelDiscount como decimal o porcentaje)
 * - Retorna { original, final, discount, nights, qty }
 */
export function calcRoomFinal({ room = {}, hotelDiscount = 0 } = {}) {
  const { unitOriginal, totalOriginal, nights, qty } = calcRoomBase(room);
  const hotelDesc = normalizeDiscount(hotelDiscount);
  const afterHotelUnit = roundTwo(unitOriginal * (1 - hotelDesc));
  const finalTotal = roundTwo(afterHotelUnit * qty);
  return {
    original: totalOriginal,
    final: finalTotal,
    descuento: roundTwo(totalOriginal - finalTotal),
    nights,
    qty,
  };
}

/* ============================
   Paquetes (packages)
   ============================ */

/**
 * calcPackageBase(pkg)
 * - Suma precios por noche de las habitaciones incluidas * noches (sin descuentos)
 * - Retorna { originalPerPackage, nights, sumPerNight }
 */
export function calcPackageBase(pkg = {}) {
  const nightsFromDates = calcNights(
    pkg.fechaInicio ?? pkg.startDate,
    pkg.fechaFin ?? pkg.endDate
  );
  const nights = Math.max(
    1,
    Math.floor(toNumber(pkg.noches ?? nightsFromDates))
  );
  const sumPerNight = (pkg.habitaciones ?? pkg.rooms ?? []).reduce(
    (acc, r) => acc + toNumber(r.precio ?? r.price),
    0
  );
  const originalPerPackage = roundTwo(sumPerNight * nights);
  return { originalPerPackage, nights, sumPerNight };
}

/**
 * calcPackageFinal({ pkg, hotelDiscount = 0 })
 * - Aplica descuento interno del paquete y luego descuento del hotel
 * - Retorna { original, final, discount, nights, qty }
 */
export function calcPackageFinal({ pkg = {}, hotelDiscount = 0 } = {}) {
  const { originalPerPackage, nights } = calcPackageBase(pkg);
  const pkgDisc = normalizeDiscount(pkg.descuento ?? pkg.discount ?? 0);
  const afterPkg = roundTwo(originalPerPackage * (1 - pkgDisc));
  const hotelDisc = normalizeDiscount(hotelDiscount);
  const afterHotel = roundTwo(afterPkg * (1 - hotelDisc));
  const qty = Math.max(1, Math.floor(toNumber(pkg.qty ?? pkg.quantity ?? 1)));
  const originalTotal = roundTwo(originalPerPackage * qty);
  const finalTotal = roundTwo(afterHotel * qty);
  return {
    original: originalTotal,
    final: finalTotal,
    descuento: roundTwo(originalTotal - finalTotal),
    nights,
    qty,
  };
}

/* ============================
   Totales / agregados
   ============================ */

/**
 * calcHotelTotal(hotel)
 * - hotel: { habitaciones, paquetes, coeficiente, temporada }
 * - Retorna { original, final, discount }
 */
export function calcHotelTotal(hotel = {}) {
  const hotelDesc = normalizeDiscount(
    hotel.coeficiente ?? hotel.coefficient ?? 0
  );
  const rooms = hotel.habitaciones ?? hotel.rooms ?? [];
  const packages = hotel.paquetes ?? hotel.packages ?? [];

  const totRooms = (rooms || []).map((r) =>
    calcRoomFinal({ room: r, hotelDiscount: hotelDesc })
  );
  const totPackages = (packages || []).map((p) =>
    calcPackageFinal({ pkg: p, hotelDiscount: hotelDesc })
  );

  const original = roundTwo(
    totRooms.reduce((acc, t) => acc + (t.original ?? 0), 0) +
      totPackages.reduce((acc, t) => acc + (t.original ?? 0), 0)
  );
  const final = roundTwo(
    totRooms.reduce((acc, t) => acc + (t.final ?? 0), 0) +
      totPackages.reduce((acc, t) => acc + (t.final ?? 0), 0)
  );

  return { original, final, descuento: roundTwo(original - final) };
}

/**
 * calcCartTotal(hotelsArray)
 * - Devuelve { original, final, discount }
 */
export function calcCartTotal(hotelsArray = []) {
  const totals = (hotelsArray || []).map((h) => calcHotelTotal(h));
  const original = roundTwo(
    totals.reduce((acc, t) => acc + (t.original ?? 0), 0)
  );
  const final = roundTwo(totals.reduce((acc, t) => acc + (t.final ?? 0), 0));
  return { original, final, descuento: roundTwo(original - final) };
}

/* ============================
   Helpers para selecciones
   ============================ */

/**
 * calcSelectedRoomsTotal(selectedIds, rooms, hotelDiscount)
 * - Devuelve total final (sumatoria) para habitaciones filtradas por ids.
 */
export function calcSelectedRoomsTotal(
  selectedIds = [],
  rooms = [],
  hotelDiscount = 0
) {
  const set = new Set((selectedIds || []).map((id) => String(id)));
  const totals = (rooms || [])
    .filter((r) => set.has(String(r.id)))
    .map((r) => calcRoomFinal({ room: r, hotelDiscount }));
  const total = roundTwo(totals.reduce((acc, t) => acc + (t.final ?? 0), 0));
  return total;
}

/**
 * calcSelectedPackagesTotal(selectedIds, packages, hotelDiscount)
 */
export function calcSelectedPackagesTotal(
  selectedIds = [],
  packages = [],
  hotelDiscount = 0
) {
  const set = new Set((selectedIds || []).map((id) => String(id)));
  const totals = (packages || [])
    .filter((p) => set.has(String(p.id)))
    .map((p) => calcPackageFinal({ pkg: p, hotelDiscount }));
  const total = roundTwo(totals.reduce((acc, t) => acc + (t.final ?? 0), 0));
  return total;
}

/**
 * calcReservationTotals(rooms, packages, isHighSeason, coefficient)
 * - Compatible con Resumen/ReservaPage
 * - Retorna { totalOriginal, totalFinal, totalDiscount }
 */
export function calcReservationTotals(
  rooms = [],
  packages = [],
  isHighSeason = false,
  coefficient = 0
) {
  const hotelDesc = isHighSeason ? coefficient : 0;
  const roomsRes = (rooms || []).map((r) =>
    calcRoomFinal({ room: r, hotelDiscount: hotelDesc })
  );
  const packagesRes = (packages || []).map((p) =>
    calcPackageFinal({ pkg: p, hotelDiscount: hotelDesc })
  );

  const totalOriginal = roundTwo(
    roomsRes.reduce((acc, r) => acc + (r.original ?? 0), 0) +
      packagesRes.reduce((acc, p) => acc + (p.original ?? 0), 0)
  );
  const totalFinal = roundTwo(
    roomsRes.reduce((acc, r) => acc + (r.final ?? 0), 0) +
      packagesRes.reduce((acc, p) => acc + (p.final ?? 0), 0)
  );
  const totalDiscount = roundTwo(totalOriginal - totalFinal);

  return { totalOriginal, totalFinal, totalDiscount };
}

/* ============================
   Compatibilidad: exports antiguos (aliases)
   ============================ */
/**
 * Exportamos los nombres en inglés como primarios (recomendado).
 * Para compatibilidad con tu código existente, también re-exporto
 * aliases con nombres originales en español.
 */
export const DEFAULT = {
  roundTwo,
  toNumber,
  calcNights,
  normalizeDiscount,
  // room
  calcRoomBase,
  calcRoomFinal,
  // package
  calcPackageBase,
  calcPackageFinal,
  // totals
  calcHotelTotal,
  calcCartTotal,
  calcReservationTotals,
  // selection helpers
  calcSelectedRoomsTotal,
  calcSelectedPackagesTotal,
};

export default DEFAULT;

// Aliases para compatibilidad (si tu código importa por ejemplo calcularTotalCarrito)
export const convertirANumero = toNumber;
export const calcularNoches = calcNights;
export const normalizarDescuento = normalizeDiscount;
export const calcularBaseHabitacion = calcRoomBase;
export const calcularPrecioFinalHabitacion = calcRoomFinal;
export const calcularBasePaquete = calcPackageBase;
export const calcularPrecioFinalPaquete = calcPackageFinal;
export const calcularTotalHotel = calcHotelTotal;
export const calcularTotalCarrito = calcCartTotal;
export const calcularTotalReserva = calcReservationTotals;
export const calcularTotalHabitacionesSeleccionadas = calcSelectedRoomsTotal;
export const calcularTotalPaquetesSeleccionados = calcSelectedPackagesTotal;
