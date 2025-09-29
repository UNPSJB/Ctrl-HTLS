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

/** Normaliza la fecha a la "medianoche" (00:00) local o UTC. */
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

/** Formatea a "dd/mm/aaaa". Si inválida devuelve '-'. */
export function formatFecha(value) {
  const d = parseDate(value);
  if (!d) return '-';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/** Útil para inputs o comparaciones legibles: "YYYY-MM-DD" | null. */
export function toISODate(value) {
  const d = parseDate(value);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

/** Suma (o resta si n negativo) días, respetando la misma zona. */
export function addDays(value, n = 0) {
  const d = parseDate(value);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + Number(n));
}

/** Calcula noches entre start y end (end > start). */
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

/** Normaliza un valor de fecha (string, Date, null, undefined) a string o null. */
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
  addDays,
  nightsBetween,
  normalizeDateValue,
};
export default DEFAULT;
