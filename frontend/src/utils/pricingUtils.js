export function toNumber(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

// calcularNoches: devuelve al menos 1 noche entre dos fechas
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

// normalizarDescuento: si viene 10 -> 0.1, si ya viene 0.1 -> 0.1. Devuelve valor entre 0 y 1
export function normalizarDescuento(v) {
  let d = toNumber(v ?? 0);
  if (d > 1) d = d / 100;
  d = Math.min(Math.max(d, 0), 1);
  return d;
}

/**
 * calcularPrecioHabitacion
 * - Compatibilidad legacy: precio * noches (sin aplicar descuento del hotel).
 * - habitacion: { precio, fechaInicio, fechaFin, qty? }
 */
export function calcularPrecioHabitacion(habitacion) {
  const noches = calcularNoches(habitacion?.fechaInicio, habitacion?.fechaFin);
  const precio = toNumber(habitacion?.precio);
  return Math.round(precio * noches * 100) / 100;
}

/**
 * calcularPrecioPaquete
 * - Compatibilidad legacy: suma precios por noche * noches * (1 - descuentoPaquete)
 * - No aplica descuento de hotel en esta función.
 */
export function calcularPrecioPaquete(paquete) {
  const noches = Math.max(
    1,
    Math.floor(
      toNumber(
        paquete?.noches ??
          calcularNoches(paquete?.fechaInicio, paquete?.fechaFin)
      )
    )
  );
  const totalHabitaciones = (paquete?.habitaciones || []).reduce(
    (acc, h) => acc + toNumber(h?.precio),
    0
  );
  let descuento = toNumber(paquete?.descuento ?? 0);
  if (descuento > 1) descuento = descuento / 100;
  descuento = Math.min(Math.max(descuento, 0), 1);
  const base =
    Math.round(totalHabitaciones * noches * (1 - descuento) * 100) / 100;
  return base;
}

/**
 * calcularPrecioFinalHabitacion
 * - Aplica descuento del hotel (hotelDesc decimal 0.15 = 15%)
 * - Devuelve { original, final, descuento }
 */
export function calcularPrecioFinalHabitacion({
  habitacion,
  descuentoHotel = 0,
}) {
  const precio = toNumber(habitacion.precio);
  const noches = calcularNoches(habitacion.fechaInicio, habitacion.fechaFin);
  const qty = Math.max(1, Math.floor(toNumber(habitacion.qty ?? 1)));

  const originalPorUnidad = precio * noches;
  const originalTotal = Math.round(originalPorUnidad * qty * 100) / 100;

  const hotelDesc = normalizarDescuento(descuentoHotel);
  const despuesHotelPorUnidad =
    Math.round(originalPorUnidad * (1 - hotelDesc) * 100) / 100;
  const finalTotal = Math.round(despuesHotelPorUnidad * qty * 100) / 100;

  return {
    original: originalTotal,
    final: finalTotal,
    descuento: Math.round((originalTotal - finalTotal) * 100) / 100,
  };
}

/**
 * calcularPrecioFinalPaquete
 * - Aplica descuento interno del paquete y luego descuento del hotel
 * - Devuelve { original, final, descuento }
 */
export function calcularPrecioFinalPaquete({ paquete, descuentoHotel = 0 }) {
  const nochesDesdeFechas = calcularNoches(
    paquete.fechaInicio,
    paquete.fechaFin
  );
  const noches = Math.max(
    1,
    Math.floor(toNumber(paquete.noches ?? nochesDesdeFechas))
  );

  const sumaPorNoche = (paquete.habitaciones || []).reduce(
    (acc, h) => acc + toNumber(h.precio),
    0
  );

  const originalPorPaquete = Math.round(sumaPorNoche * noches * 100) / 100;

  const descPaquete = normalizarDescuento(paquete.descuento);
  const despuesPaquete =
    Math.round(originalPorPaquete * (1 - descPaquete) * 100) / 100;

  const hotelDesc = normalizarDescuento(descuentoHotel);
  const despuesHotel = Math.round(despuesPaquete * (1 - hotelDesc) * 100) / 100;

  const qty = Math.max(1, Math.floor(toNumber(paquete.qty ?? 1)));

  const originalTotal = Math.round(originalPorPaquete * qty * 100) / 100;
  const finalTotal = Math.round(despuesHotel * qty * 100) / 100;

  return {
    original: originalTotal,
    final: finalTotal,
    descuento: Math.round((originalTotal - finalTotal) * 100) / 100,
  };
}

/**
 * calcularTotalHotel
 * - hotel: { habitaciones: [...], paquetes: [...], coeficiente?, temporada? }
 * - Aplica coeficiente del hotel como descuento (coeficiente decimal 0.15 -> 15%)
 * - Devuelve { original, final, descuento }
 */
export function calcularTotalHotel(hotel = {}) {
  // Si tenés temporada y querés que SOLO aplique en "alta", descomentá:
  // const hotelDesc = hotel.temporada === 'alta' ? normalizarDescuento(hotel.coeficiente ?? 0) : 0;
  const hotelDesc = normalizarDescuento(hotel.coeficiente ?? 0);

  const habitaciones = hotel.habitaciones || [];
  const paquetes = hotel.paquetes || [];

  const totRooms = habitaciones.map((h) =>
    calcularPrecioFinalHabitacion({ habitacion: h, descuentoHotel: hotelDesc })
  );
  const totPackages = paquetes.map((p) =>
    calcularPrecioFinalPaquete({ paquete: p, descuentoHotel: hotelDesc })
  );

  const original =
    totRooms.reduce((acc, t) => acc + t.original, 0) +
    totPackages.reduce((acc, t) => acc + t.original, 0);
  const final =
    totRooms.reduce((acc, t) => acc + t.final, 0) +
    totPackages.reduce((acc, t) => acc + t.final, 0);

  return {
    original: Math.round(original * 100) / 100,
    final: Math.round(final * 100) / 100,
    descuento: Math.round((original - final) * 100) / 100,
  };
}

/**
 * calcularTotalCarrito
 * - hotelesArray: array de hoteles (estado.carrito.hoteles)
 * - Devuelve { original, final, descuento }
 */
export function calcularTotalCarrito(hotelesArray = []) {
  const totales = (hotelesArray || []).map((h) => calcularTotalHotel(h));
  const original = totales.reduce((acc, t) => acc + t.original, 0);
  const final = totales.reduce((acc, t) => acc + t.final, 0);
  return {
    original: Math.round(original * 100) / 100,
    final: Math.round(final * 100) / 100,
    descuento: Math.round((original - final) * 100) / 100,
  };
}

export function calcularTotalReserva(
  habitaciones = [],
  paquetes = [],
  isHighSeason = false,
  coeficiente = 1
) {
  // Calcular subtotal de habitaciones
  const totalHabitaciones = habitaciones.reduce((acc, hab) => {
    const precioBase = hab.precio * (hab.cantidad || 1);
    const precioFinal = isHighSeason ? precioBase * coeficiente : precioBase;
    return acc + precioFinal;
  }, 0);

  // Calcular subtotal de paquetes
  const totalPaquetes = paquetes.reduce((acc, pack) => {
    const precioBase = pack.precioFinal * (pack.cantidad || 1);
    return acc + precioBase;
  }, 0);

  // Total general
  const totalFinal = totalHabitaciones + totalPaquetes;

  return {
    totalHabitaciones,
    totalPaquetes,
    totalFinal,
  };
}

// Export por defecto (opcional)
export default {
  toNumber,
  calcularNoches,
  normalizarDescuento,
  calcularPrecioHabitacion,
  calcularPrecioPaquete,
  calcularPrecioFinalHabitacion,
  calcularPrecioFinalPaquete,
  calcularTotalHotel,
  calcularTotalCarrito,
  calcularTotalReserva,
};
