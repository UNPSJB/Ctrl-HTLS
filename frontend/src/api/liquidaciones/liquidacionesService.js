import axiosInstance from '@/api/axiosInstance';

/**
 * Obtiene las liquidaciones de un vendedor específico, opcionalmente filtradas por fecha.
 * @param {number|string} vendedorId - ID del vendedor.
 * @param {object} [params] - Parámetros de la petición (fechaInicio, fechaFin).
 * @param {object} [config] - Configuración extra para Axios (ej. signal para AbortController).
 * @returns {Promise<Array>} Lista de liquidaciones del vendedor en el periodo.
 */
export const getLiquidacionesVendedor = async (vendedorId, params = {}, config = {}) => {
  // Limpiar params nulos o vacíos
  const query = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));
  const response = await axiosInstance.get(`/liquidaciones/vendedor/${vendedorId}`, { params: query, ...config });
  return response.data;
};
