import { parseDate, toISODate, getStartOfWeek } from './dateUtils';

/**
 * Obtiene el rango de fechas (inicio y fin) en formato YYYY-MM-DD
 * basado en el preset seleccionado o en fechas personalizadas.
 *
 * Nota: Los endpoints de ventas y liquidaciones (obtenerVentasVendedor,
 * obtenerLiquidacionesVendedor, buscarVentas) aceptan fechaInicio === fechaFin
 * porque usan Op.between con hastaFinDeDia = endDay a las 23:59:59.
 * Por eso los presets usan los días naturales del rango sin agregar +1 al final.
 *
 * @param {object} filter - Filtro de fechas
 * @param {string} filter.tipo - Tipo de filtro ('all', 'currentWeek', 'previousWeek', 'currentMonth', 'previousMonth', 'last3Months', 'custom')
 * @param {string} [filter.inicio] - Fecha inicio (para custom)
 * @param {string} [filter.fin] - Fecha fin (para custom)
 * @returns {{fechaInicio: string|null, fechaFin: string|null}}
 */
export const getDateRangeByPreset = (filter) => {
  if (!filter) {
    return { fechaInicio: null, fechaFin: null };
  }

  const hoy = new Date();

  if (filter.tipo === 'all') {
    return {
      fechaInicio: '2010-01-01',
      fechaFin: toISODate(hoy),
    };
  }

  let filterStart = null;
  let filterEnd = null;

  if (filter.tipo === 'currentWeek') {
    // Lunes de la semana actual → Domingo de la semana actual
    filterStart = getStartOfWeek();
    filterEnd = new Date(filterStart);
    filterEnd.setDate(filterEnd.getDate() + 6);
  } else if (filter.tipo === 'previousWeek') {
    // Lunes de la semana anterior → Domingo de la semana anterior
    const lunesActual = getStartOfWeek();
    filterEnd = new Date(lunesActual);
    filterEnd.setDate(filterEnd.getDate() - 1); // Domingo anterior
    filterStart = new Date(lunesActual);
    filterStart.setDate(filterStart.getDate() - 7); // Lunes anterior
  } else if (filter.tipo === 'currentMonth') {
    // Primer día del mes actual → Último día del mes actual
    filterStart = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    filterEnd = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  } else if (filter.tipo === 'previousMonth') {
    // Primer día del mes anterior → Último día del mes anterior
    filterStart = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    filterEnd = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  } else if (filter.tipo === 'last3Months') {
    // Primer día de hace 3 meses → Hoy
    filterStart = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
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
