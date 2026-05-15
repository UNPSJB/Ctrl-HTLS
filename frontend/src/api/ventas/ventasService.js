import axiosInstance from '@/api/axiosInstance';

/**
 * Busca ventas según los filtros proporcionados.
 * Todos los filtros son opcionales pero se requiere al menos uno.
 * Los parámetros vacíos o nulos no se envían al backend.
 *
 * @param {object} filtros - Objeto con los filtros de búsqueda.
 * @param {string} [filtros.fechaInicio] - Fecha de inicio en formato YYYY-MM-DD.
 * @param {string} [filtros.fechaFin]    - Fecha de fin en formato YYYY-MM-DD.
 * @param {string} [filtros.nombreHotel] - Nombre parcial del hotel.
 * @param {string} [filtros.dniCliente]  - Número de documento del cliente.
 * @param {string} [filtros.dniVendedor] - Número de documento del vendedor.
 * @returns {Promise<Array>} Lista de ventas que coinciden con los filtros.
 */
export const buscarVentas = async (filtros = {}) => {
  // Solo se envían los parámetros que tienen valor para no disparar
  // el error 400 del backend por "al menos un filtro requerido"
  const params = {};
  if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
  if (filtros.fechaFin)    params.fechaFin    = filtros.fechaFin;
  if (filtros.nombreHotel) params.nombreHotel = filtros.nombreHotel;
  if (filtros.dniCliente)  params.dniCliente  = filtros.dniCliente;
  if (filtros.dniVendedor) params.dniVendedor = filtros.dniVendedor;

  const response = await axiosInstance.get('/buscar-ventas', { params });
  return response.data;
};

/**
 * Obtiene el detalle completo de una factura/venta por su ID.
 * @param {number|string} facturaId - ID de la factura.
 * @returns {Promise<object>} Detalle de la venta con hotel, cliente, vendedor, alquiler, habitaciones y paquetes.
 */
export const getDetalleFactura = async (facturaId) => {
  const response = await axiosInstance.get(`/factura/${facturaId}/detalle`);
  return response.data;
};

/**
 * Obtiene el resumen de ventas agrupado por día, semana y mes.
 * @returns {Promise<{dia: {cantidad, total}, semana: {cantidad, total}, mes: {cantidad, total}}>}
 */
export const getResumenVentas = async () => {
  const response = await axiosInstance.get('/ventas');
  return response.data;
};

/**
 * Obtiene todas las ventas realizadas en una fecha específica.
 * @param {string} fecha - Fecha en formato YYYY-MM-DD.
 * @returns {Promise<Array<{hotel, vendedor, cliente, monto}>>}
 */
export const getVentasPorFecha = async (fecha) => {
  const response = await axiosInstance.get('/ventas-por-fecha', { params: { fecha } });
  return response.data;
};

/**
 * Obtiene las ventas de un vendedor específico, opcionalmente filtradas por fecha.
 * @param {number|string} vendedorId - ID del vendedor.
 * @param {object} [params] - Parámetros de la petición (fechaInicio, fechaFin).
 * @param {object} [config] - Configuración extra para Axios (ej. signal para AbortController).
 * @returns {Promise<Array>} Lista de ventas del vendedor en el periodo.
 */
export const getVentasVendedor = async (vendedorId, params = {}, config = {}) => {
  // Limpiar params nulos o vacíos
  const query = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));
  const response = await axiosInstance.get(`/ventas/${vendedorId}`, { params: query, ...config });
  return response.data;
};

export const getVentasAnuales = async () => {
  const response = await axiosInstance.get('/ventas-anuales');
  return response.data;
};

export const getTopVentas = async () => {
  const response = await axiosInstance.get('/top-ventas');
  return response.data;
};
