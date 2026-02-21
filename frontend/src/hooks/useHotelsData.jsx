import { useMemo, useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { transformHoteles } from './hotelTransformer';

/**
 * Hook centralizado para obtener y transformar los datos de los hoteles.
 * Conectado a la API real del backend.
 *
 * @returns {{hoteles: Array, loading: boolean, error: any}}
 */
export function useHotelsData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoteles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/hoteles');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hoteles:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoteles();
  }, []);

  // Usamos useMemo para asegurarnos de que la transformación de datos
  // solo se ejecute cuando los datos cambien.
  const hotelesNormalizados = useMemo(() => {
    if (typeof transformHoteles === 'function') {
      return transformHoteles(data);
    }
    return data;
  }, [data]);

  return {
    hoteles: hotelesNormalizados,
    loading,
    error,
  };
}
