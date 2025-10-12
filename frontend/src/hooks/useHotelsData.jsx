import { useMemo } from 'react';
import hotelsData from '@/data/hotels.json';
import { transformHoteles } from './hotelTransformer';

/**
 * Hook centralizado para obtener y transformar los datos de los hoteles.
 * Actualmente, carga los datos desde un JSON estático, pero está diseñado
 * para conectarse fácilmente a una API en el futuro.
 *
 * @returns {{hoteles: Array, loading: boolean, error: any}}
 */
export function useHotelsData() {
  // Usamos useMemo para asegurarnos de que la transformación de datos
  // solo se ejecute una vez, a menos que los datos originales cambien.
  const hotelesNormalizados = useMemo(() => {
    // La función transformHoteles se encarga de normalizar un array de hoteles.
    // Asumimos que ya tienes esta función en tu hotelTransformer.jsx
    if (typeof transformHoteles === 'function') {
      return transformHoteles(hotelsData);
    }
    // Fallback por si la función no existe, aunque en tu caso sí existe.
    return hotelsData.map((h) => ({ ...h, estrellas: Number(h.estrellas) }));
  }, []); // El array de dependencias vacío asegura que solo se ejecute una vez.

  // Preparamos el hook para el futuro: cuando conectes tu backend,
  // aquí manejarías los estados de carga y error.
  const loading = false; // Cambiará a true mientras se hace la petición a la API
  const error = null; // Contendrá el error si la petición falla

  return {
    hoteles: hotelesNormalizados,
    loading,
    error,
  };
}
