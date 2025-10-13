export function parseDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? new Date(value.getTime()) : null;
  }
  const s = String(value).trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (dateOnlyMatch) {
    const y = Number(dateOnlyMatch[1]);
    const m = Number(dateOnlyMatch[2]) - 1;
    const d = Number(dateOnlyMatch[3]);
    const localDate = new Date(y, m, d);
    return Number.isFinite(localDate.getTime()) ? localDate : null;
  }
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}

export function isValidDate(d) {
  return d instanceof Date && Number.isFinite(d.getTime());
}

export function startOfDay(date, { useUTC = false } = {}) {
  const d = parseDate(date);
  if (!d) return null;
  if (useUTC) {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatFecha(value) {
  const d = parseDate(value);
  if (!d) return '-';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

export function toISODate(value) {
  const d = parseDate(value);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export function nightsBetween(
  start,
  end,
  { useUTC = false, minNights = 1 } = {}
) {
  const s = startOfDay(start, { useUTC });
  const e = startOfDay(end, { useUTC });
  if (!s || !e || e <= s)
    return Math.max(1, Math.floor(Number(minNights) || 1));
  const diffMs = e - s;
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

/**
 * --- NUEVA FUNCIÓN ---
 * Calcula el número de noches de un alquiler que se superponen con un rango de fechas de temporada.
 * @param {object} alquiler - Rango de fechas del alquiler { fechaInicio, fechaFin }.
 * @param {object} limite - Rango de fechas de la temporada { fechaInicio, fechaFin }.
 * @returns {number} - El número de noches que están dentro de la temporada.
 */
export function calculateOverlapNights(alquiler, limite) {
  if (!alquiler || !limite) return 0;

  const alquilerInicio = parseDate(alquiler.fechaInicio);
  const alquilerFin = parseDate(alquiler.fechaFin);
  const limiteInicio = parseDate(limite.fechaInicio);
  const limiteFin = parseDate(limite.fechaFin);

  if (!alquilerInicio || !alquilerFin || !limiteInicio || !limiteFin) return 0;

  // Encontrar el punto de inicio de la superposición
  const overlapStart = new Date(Math.max(alquilerInicio, limiteInicio));
  // Encontrar el punto final de la superposición
  const overlapEnd = new Date(Math.min(alquilerFin, limiteFin));

  // Si el inicio de la superposición es después del final, no hay superposición
  if (overlapStart >= overlapEnd) {
    return 0;
  }

  // Calculamos las noches dentro del período de superposición
  return nightsBetween(overlapStart, overlapEnd, {
    useUTC: true,
    minNights: 0,
  });
}

export function normalizeDateValue(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

const DEFAULT = {
  parseDate,
  isValidDate,
  startOfDay,
  formatFecha,
  toISODate,
  nightsBetween,
  calculateOverlapNights, // <-- Exportamos la nueva función
  normalizeDateValue,
};
export default DEFAULT;
