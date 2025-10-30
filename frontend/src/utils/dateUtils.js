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

/**
 * Verifica si dos rangos de fechas se superponen.
 * @param {object} range1 - { fechaInicio, fechaFin }
 * @param {object} range2 - { fechaInicio, fechaFin }
 * @returns {boolean} - True si hay superposición, de lo contrario false.
 */
export function dateRangesOverlap(range1, range2) {
  if (!range1 || !range2) return false;

  const start1 = parseDate(range1.fechaInicio);
  const end1 = parseDate(range1.fechaFin);
  const start2 = parseDate(range2.fechaInicio);
  const end2 = parseDate(range2.fechaFin);

  if (!start1 || !end1 || !start2 || !end2) return false;

  // La superposición ocurre si un rango comienza antes de que el otro termine,
  // y termina después de que el otro comience.
  return start1 < end2 && start2 < end1;
}

const DEFAULT = {
  parseDate,
  isValidDate,
  startOfDay,
  formatFecha,
  toISODate,
  nightsBetween,
  calculateOverlapNights,
  normalizeDateValue,
  dateRangesOverlap,
};
export default DEFAULT;
