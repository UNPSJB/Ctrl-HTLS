import { useMemo, useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { transformHoteles } from './hotelTransformer';
import { toast } from 'react-hot-toast';

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
        const errorMsg = err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
        setError(errorMsg);
        toast.error(errorMsg, { id: 'fetch-error-hotels' });
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
