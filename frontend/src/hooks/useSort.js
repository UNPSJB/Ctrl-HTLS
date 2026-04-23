import { useState, useMemo } from 'react';

/**
 * Obtiene el valor de una clave anidada en un objeto.
 * Soporta rutas como 'ubicacion.nombreCiudad'.
 */
function getNestedValue(obj, key) {
  return key.split('.').reduce((acc, k) => acc?.[k], obj);
}

/**
 * Hook para ordenamiento dinámico de arrays por columna.
 *
 * @param {Array} data - Array de objetos a ordenar
 * @param {string} defaultKey - Clave de ordenamiento por defecto
 * @param {'asc'|'desc'} defaultDir - Dirección inicial del ordenamiento
 * @param {Object} comparators - Mapa opcional de comparadores personalizados por clave de columna.
 *   Cada comparador recibe (a, b) y debe devolver un número negativo, 0 o positivo (igual que Array.sort).
 *   Ejemplo: { 'categoria.estrellas': (a, b) => getOrden(a) - getOrden(b) }
 * @returns {{ sortedData, sortKey, sortDir, handleSort }}
 */
export function useSort(data, defaultKey = '', defaultDir = 'asc', comparators = {}) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const handleSort = (key) => {
    if (key === sortKey) {
      // Alternar dirección en el mismo campo
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Nuevo campo → siempre ascendente
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !data) return data ?? [];
    return [...data].sort((a, b) => {
      // Si existe un comparador personalizado para esta columna, usarlo
      if (comparators[sortKey]) {
        const cmp = comparators[sortKey](a, b);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      // Comparador genérico con soporte numérico y locale español
      const aVal = getNestedValue(a, sortKey) ?? '';
      const bVal = getNestedValue(b, sortKey) ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sortKey, sortDir]);

  return { sortedData, sortKey, sortDir, handleSort };
}
