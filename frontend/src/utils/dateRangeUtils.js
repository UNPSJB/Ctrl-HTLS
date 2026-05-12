import { parseDate, toISODate } from './dateUtils';

/**
 * Obtiene el rango de fechas (inicio y fin) en formato YYYY-MM-DD
 * basado en el preset seleccionado o en fechas personalizadas.
 *
 * @param {object} filter - Filtro de fechas
 * @param {string} filter.tipo - Tipo de filtro ('all', 'lastWeek', 'lastMonth', 'last3Months', 'custom')
 * @param {string} [filter.inicio] - Fecha inicio (para custom)
 * @param {string} [filter.fin] - Fecha fin (para custom)
 * @returns {{fechaInicio: string|null, fechaFin: string|null}}
 */
export const getDateRangeByPreset = (filter) => {
  if (!filter || filter.tipo === 'all') {
    return { fechaInicio: null, fechaFin: null };
  }

  const hoy = new Date();
  let filterStart = null;
  let filterEnd = null;

  if (filter.tipo === 'lastWeek') {
    filterStart = new Date(hoy);
    filterStart.setDate(hoy.getDate() - 7);
    filterEnd = hoy;
  } else if (filter.tipo === 'lastMonth') {
    filterStart = new Date(hoy);
    filterStart.setMonth(hoy.getMonth() - 1);
    filterEnd = hoy;
  } else if (filter.tipo === 'last3Months') {
    filterStart = new Date(hoy);
    filterStart.setMonth(hoy.getMonth() - 3);
    filterEnd = hoy;
  } else if (filter.tipo === 'custom') {
    if (filter.inicio) filterStart = parseDate(filter.inicio);
    if (filter.fin) filterEnd = parseDate(filter.fin);
  }

  return {
    fechaInicio: filterStart ? toISODate(filterStart) : null,
    fechaFin: filterEnd ? toISODate(filterEnd) : null,
  };
};
