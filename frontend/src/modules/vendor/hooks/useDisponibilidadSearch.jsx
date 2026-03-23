import { useState, useCallback } from 'react';
import axiosInstance from '@api/axiosInstance';

export const useDisponibilidadSearch = () => {
  const [hoteles, setHoteles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarDisponibilidad = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);
    setHoteles([]); // Limpiar resultados anteriores

    //console.log('Enviando parámetros a la API:', params);

    try {
      const response = await axiosInstance.get('/disponibilidad', { params });
      //console.log('✅ Respuesta del Backend:', response.data);
      setHoteles(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('❌ Error al buscar disponibilidad:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { hoteles, isLoading, error, buscarDisponibilidad };
};
