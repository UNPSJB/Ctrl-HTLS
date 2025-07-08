import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance'; // o donde hayas configurado axios

const useHotel = () => {
  const [tiposHabitaciones, setTiposHabitacion] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resTipos, resCategorias, resEncargados] = await Promise.all([
          axios.get('/obtener-tiposHabitaciones'),
          axios.get('/categorias'),
        ]);

        setTiposHabitacion(resTipos.data || []);
        setCategorias(resCategorias.data || []);
      } catch (error) {
        console.error('Error al cargar datos del formulario:', error.message);
        setError(error.message);
        // Fallback a arrays vacíos en caso de error
        setTiposHabitacion([]);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { tiposHabitaciones, categorias, loading, error };
};

export default useHotel;
