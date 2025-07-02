import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance'; // o donde hayas configurado axios

const useHotel = () => {
  const [tiposHabitaciones, setTiposHabitacion] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [encargados, setEncargados] = useState([]);
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
          axios.get('/encargados'),
        ]);

        setTiposHabitacion(resTipos.data || []);
        setCategorias(resCategorias.data || []);
        setEncargados(resEncargados.data || []);
      } catch (error) {
        console.error('Error al cargar datos del formulario:', error.message);
        setError(error.message);
        // Fallback a arrays vacíos en caso de error
        setTiposHabitacion([]);
        setCategorias([]);
        setEncargados([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { tiposHabitaciones, categorias, encargados, loading, error };
};

export default useHotel;
