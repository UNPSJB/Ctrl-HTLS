/////////////////////////
// Helpers
/////////////////////////

/** convertirANumero(v) -> normaliza a Number seguro */
export function convertirANumero(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** calcularNoches(fechaInicio, fechaFin) -> devuelve al menos 1 noche */
export function calcularNoches(fechaInicio, fechaFin) {
  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(fin.getTime()))
      return 1;
    const diffMs = Math.abs(fin - inicio);
    const noches = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, noches);
  } catch {
    return 1;
  }
}

/** normalizarDescuento(v) -> convierte 10 -> 0.1 y limita entre 0 y 1 */
export function normalizarDescuento(v) {
  let d = convertirANumero(v ?? 0);
  if (d > 1) d = d / 100;
  d = Math.min(Math.max(d, 0), 1);
  return d;
}

/////////////////////////
// Habitaciones
/////////////////////////

/**
 * calcularBaseHabitacion(habitacion)
 * - Devuelve: { originalPorUnidad, originalTotal, noches, qty }
 * - No aplica descuentos aún.
 */
export function calcularBaseHabitacion(habitacion = {}) {
  const precio = convertirANumero(habitacion.precio ?? habitacion.price);
  const noches = calcularNoches(
    habitacion.fechaInicio ?? habitacion.startDate,
    habitacion.fechaFin ?? habitacion.endDate
  );
  const qty = Math.max(
    1,
    Math.floor(convertirANumero(habitacion.qty ?? habitacion.quantity ?? 1))
  );
  const originalPorUnidad = precio * noches;
  const originalTotal = Math.round(originalPorUnidad * qty * 100) / 100;
  return { originalPorUnidad, originalTotal, noches, qty };
}

/**
 * calcularPrecioFinalHabitacion({ habitacion, descuentoHotel = 0 })
 * - Aplica descuento del hotel (decimal, ej. 0.15)
 * - Retorna { original, final, descuento, noches, qty }
 */
export function calcularPrecioFinalHabitacion({
  habitacion = {},
  descuentoHotel = 0,
} = {}) {
  const { originalPorUnidad, originalTotal, noches, qty } =
    calcularBaseHabitacion(habitacion);
  const hotelDesc = normalizarDescuento(descuentoHotel);
  const despuesHotelPorUnidad =
    Math.round(originalPorUnidad * (1 - hotelDesc) * 100) / 100;
  const finalTotal = Math.round(despuesHotelPorUnidad * qty * 100) / 100;
  return {
    original: originalTotal,
    final: finalTotal,
    descuento: Math.round((originalTotal - finalTotal) * 100) / 100,
    noches,
    qty,
  };
}

/////////////////////////
// Paquetes
/////////////////////////

/**
 * calcularBasePaquete(paquete)
 * - Suma precios por noche de las habitaciones incluidas * noches (sin descuentos)
 * - Retorna { originalPorPaquete, noches, sumaPorNoche }
 */
export function calcularBasePaquete(paquete = {}) {
  const nochesDesdeFechas = calcularNoches(
    paquete.fechaInicio ?? paquete.startDate,
    paquete.fechaFin ?? paquete.endDate
  );
  const noches = Math.max(
    1,
    Math.floor(convertirANumero(paquete.noches ?? nochesDesdeFechas))
  );
  const sumaPorNoche = (paquete.habitaciones ?? paquete.rooms ?? []).reduce(
    (acc, r) => acc + convertirANumero(r.precio ?? r.price),
    0
  );
  const originalPorPaquete = Math.round(sumaPorNoche * noches * 100) / 100;
  return { originalPorPaquete, noches, sumaPorNoche };
}

/**
 * calcularPrecioFinalPaquete({ paquete, descuentoHotel = 0 })
 * - Aplica descuento interno del paquete y luego descuento del hotel
 * - Retorna { original, final, descuento, noches, qty }
 */
export function calcularPrecioFinalPaquete({
  paquete = {},
  descuentoHotel = 0,
} = {}) {
  const { originalPorPaquete, noches } = calcularBasePaquete(paquete);
  const descPaquete = normalizarDescuento(
    paquete.descuento ?? paquete.discount ?? 0
  );
  const despuesPaquete =
    Math.round(originalPorPaquete * (1 - descPaquete) * 100) / 100;
  const hotelDesc = normalizarDescuento(descuentoHotel);
  const despuesHotel = Math.round(despuesPaquete * (1 - hotelDesc) * 100) / 100;
  const qty = Math.max(
    1,
    Math.floor(convertirANumero(paquete.qty ?? paquete.quantity ?? 1))
  );
  const originalTotal = Math.round(originalPorPaquete * qty * 100) / 100;
  const finalTotal = Math.round(despuesHotel * qty * 100) / 100;
  return {
    original: originalTotal,
    final: finalTotal,
    descuento: Math.round((originalTotal - finalTotal) * 100) / 100,
    noches,
    qty,
  };
}

/////////////////////////
// Totales / Agregados
/////////////////////////

/**
 * calcularTotalHotel(hotel)
 * - hotel: { habitaciones, paquetes, coeficiente, temporada }
 * - Retorna { original, final, descuento }
 */
export function calcularTotalHotel(hotel = {}) {
  const hotelDesc = normalizarDescuento(
    hotel.coeficiente ?? hotel.coefficient ?? 0
  );
  const habitaciones = hotel.habitaciones ?? hotel.rooms ?? [];
  const paquetes = hotel.paquetes ?? hotel.packages ?? [];

  const totRooms = (habitaciones || []).map((h) =>
    calcularPrecioFinalHabitacion({ habitacion: h, descuentoHotel: hotelDesc })
  );
  const totPackages = (paquetes || []).map((p) =>
    calcularPrecioFinalPaquete({ paquete: p, descuentoHotel: hotelDesc })
  );

  const original =
    totRooms.reduce((acc, t) => acc + (t.original ?? 0), 0) +
    totPackages.reduce((acc, t) => acc + (t.original ?? 0), 0);
  const final =
    totRooms.reduce((acc, t) => acc + (t.final ?? 0), 0) +
    totPackages.reduce((acc, t) => acc + (t.final ?? 0), 0);

  return {
    original: Math.round(original * 100) / 100,
    final: Math.round(final * 100) / 100,
    descuento: Math.round((original - final) * 100) / 100,
  };
}

/**
 * calcularTotalCarrito(hotelesArray)
 * - Devuelve { original, final, descuento }
 */
export function calcularTotalCarrito(hotelesArray = []) {
  const totales = (hotelesArray || []).map((h) => calcularTotalHotel(h));
  const original = totales.reduce((acc, t) => acc + (t.original ?? 0), 0);
  const final = totales.reduce((acc, t) => acc + (t.final ?? 0), 0);
  return {
    original: Math.round(original * 100) / 100,
    final: Math.round(final * 100) / 100,
    descuento: Math.round((original - final) * 100) / 100,
  };
}

/////////////////////////
// Helpers para selecciones
/////////////////////////

/**
 * calcularTotalHabitacionesSeleccionadas(selectedIds, habitaciones, descuentoHotel)
 * - selectedIds: array de ids (string|number)
 * - habitaciones: array completo
 * - Devuelve total final (sumatoria)
 */
export function calcularTotalHabitacionesSeleccionadas(
  selectedIds = [],
  habitaciones = [],
  descuentoHotel = 0
) {
  const selectedSet = new Set((selectedIds || []).map((id) => String(id)));
  const totals = (habitaciones || [])
    .filter((h) => selectedSet.has(String(h.id)))
    .map((h) =>
      calcularPrecioFinalHabitacion({ habitacion: h, descuentoHotel })
    );
  const total = totals.reduce((acc, t) => acc + (t.final ?? 0), 0);
  return Math.round(total * 100) / 100;
}

/**
 * calcularTotalPaquetesSeleccionados(selectedIds, paquetes, descuentoHotel)
 */
export function calcularTotalPaquetesSeleccionados(
  selectedIds = [],
  paquetes = [],
  descuentoHotel = 0
) {
  const selectedSet = new Set((selectedIds || []).map((id) => String(id)));
  const totals = (paquetes || [])
    .filter((p) => selectedSet.has(String(p.id)))
    .map((p) => calcularPrecioFinalPaquete({ paquete: p, descuentoHotel }));
  const total = totals.reduce((acc, t) => acc + (t.final ?? 0), 0);
  return Math.round(total * 100) / 100;
}

/**
 * calcularTotalReserva(habitaciones, paquetes, isHighSeason, coeficiente)
 * - Para compatibilidad con Resumen/ReservaPage
 * - Retorna { totalOriginal, totalFinal, totalDescuento }
 */
export function calcularTotalReserva(
  habitaciones = [],
  paquetes = [],
  isHighSeason = false,
  coeficiente = 0
) {
  const hotelDesc = isHighSeason ? coeficiente : 0;
  const roomsRes = (habitaciones || []).map((r) =>
    calcularPrecioFinalHabitacion({ habitacion: r, descuentoHotel: hotelDesc })
  );
  const packagesRes = (paquetes || []).map((p) =>
    calcularPrecioFinalPaquete({ paquete: p, descuentoHotel: hotelDesc })
  );

  const totalOriginal =
    roomsRes.reduce((acc, r) => acc + (r.original ?? 0), 0) +
    packagesRes.reduce((acc, p) => acc + (p.original ?? 0), 0);
  const totalFinal =
    roomsRes.reduce((acc, r) => acc + (r.final ?? 0), 0) +
    packagesRes.reduce((acc, p) => acc + (p.final ?? 0), 0);
  const totalDescuento = Math.round((totalOriginal - totalFinal) * 100) / 100;

  return {
    totalOriginal: Math.round(totalOriginal * 100) / 100,
    totalFinal: Math.round(totalFinal * 100) / 100,
    totalDescuento,
  };
}

const DEFAULT = {
  convertirANumero,
  calcularNoches,
  normalizarDescuento,
  // habitación
  calcularBaseHabitacion,
  calcularPrecioFinalHabitacion,
  // paquete
  calcularBasePaquete,
  calcularPrecioFinalPaquete,
  // totales
  calcularTotalHotel,
  calcularTotalCarrito,
  calcularTotalReserva,
  // helpers de selección
  calcularTotalHabitacionesSeleccionadas,
  calcularTotalPaquetesSeleccionados,
};

export default DEFAULT;
