/**
 * Utilidades para manipulación y formateo de números.
 */

/**
 * Formatea un número de factura rellenando con ceros a la izquierda
 * hasta alcanzar una longitud fija de 8 dígitos.
 * Ejemplo: 32 → "00000032", 123 → "00000123"
 * @param {number|string} numero - El número de factura a formatear.
 * @returns {string} El número formateado con ceros a la izquierda.
 */
export const formatNumeroFactura = (numero) => {
  if (numero === null || numero === undefined || numero === '') return '—';
  return String(Number(numero)).padStart(8, '0');
};
