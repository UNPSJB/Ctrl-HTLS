// src/utils/dateUtils.js
// Utilidades simples y seguras para fechas (formato y noches).
// Comentarios en español; exports nombrados.

/**
 * parseDate(value) -> Date | null
 * - Acepta: Date, timestamp, string ISO, string legible por Date.
 * - Devuelve null si no puede parsear.
 */
export function parseDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? new Date(value) : null;
  }
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** isValidDate(d) -> boolean */
export function isValidDate(d) {
  return d instanceof Date && Number.isFinite(d.getTime());
}

/**
 * startOfDay(date, { useUTC = false })
 * - Normaliza la fecha a la "medianoche" (00:00) local o UTC.
 * - Devuelve null si input inválido.
 */
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

/**
 * formatFecha(value) -> string
 * - Formatea a "dd/mm/aaaa". Si inválida devuelve '-'.
 */
export function formatFecha(value) {
  const d = parseDate(value);
  if (!d) return '-';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * toISODate(value) -> "YYYY-MM-DD" | null
 * - Útil para inputs o comparaciones legibles.
 */
export function toISODate(value) {
  const d = parseDate(value);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

/**
 * addDays(value, n) -> Date | null
 * - Suma (o resta si n negativo) días, respetando la misma zona (no usa UTC).
 */
export function addDays(value, n = 0) {
  const d = parseDate(value);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + Number(n));
}

/**
 * nightsBetween(start, end, { useUTC = false, minNights = 1 })
 * - Calcula noches entre start y end (end > start). Devuelve al menos minNights.
 * - Si end <= start devuelve minNights.
 * - useUTC true normaliza calculo en UTC (reduce problemas por cambios de hora).
 */
export function nightsBetween(
  start,
  end,
  { useUTC = false, minNights = 1 } = {}
) {
  const s = startOfDay(start, { useUTC });
  const e = startOfDay(end, { useUTC });
  if (!s || !e) return Math.max(1, Math.floor(Number(minNights) || 1));
  if (e <= s) return Math.max(1, Math.floor(Number(minNights) || 1));
  const diffMs = e - s;
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

/** Export por defecto práctico */
const DEFAULT = {
  parseDate,
  isValidDate,
  startOfDay,
  formatFecha,
  toISODate,
  addDays,
  nightsBetween,
};
export default DEFAULT;
