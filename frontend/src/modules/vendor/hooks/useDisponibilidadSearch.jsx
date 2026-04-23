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

    try {
      const response = await axiosInstance.get('/disponibilidad', { params });
      setHoteles(response.data || []);
    } catch (err) {
      // Si el servidor devuelve 404 (No se encontro hotel o disponibilidad), 
      // lo tratamos como un listado vacio para que StateMessage lo dibuje cordialmente.
      if (err.response?.status === 404) {
        setHoteles([]);
      } else {
        const errorMessage = err.response?.data?.error || err.message;
        console.error('❌ Error al buscar disponibilidad:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { hoteles, isLoading, error, buscarDisponibilidad };
};
