import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

// Pequeña función de ayuda para capitalizar la primera letra de un string
const capitalize = (str) => {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const useUbicacion = () => {
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisId, setPaisId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [ciudadId, setCiudadId] = useState('');

  // Cargar países
  useEffect(() => {
    axios
      .get('/paises')
      .then((res) => {
        // Capitalizamos el nombre de cada país
        const capitalizedData = res.data.map((item) => ({
          ...item,
          nombre: capitalize(item.nombre),
        }));
        setPaises(capitalizedData);
      })
      .catch((err) => console.error('Error cargando países:', err));
  }, []);

  // Cargar provincias cuando cambia el país
  useEffect(() => {
    if (!paisId) {
      setProvincias([]);
      setProvinciaId('');
      return;
    }

    axios
      .get(`/provincias/${paisId}`)
      .then((res) => {
        // Capitalizamos el nombre de cada provincia
        const capitalizedData = res.data.map((item) => ({
          ...item,
          nombre: capitalize(item.nombre),
        }));
        setProvincias(capitalizedData);
      })
      .catch((err) => console.error('Error cargando provincias:', err));
  }, [paisId]);

  // Cargar ciudades cuando cambia la provincia
  useEffect(() => {
    if (!provinciaId) {
      setCiudades([]);
      setCiudadId('');
      return;
    }

    axios
      .get(`/ciudades/${provinciaId}`)
      .then((res) => {
        // Capitalizamos el nombre de cada ciudad
        const capitalizedData = res.data.map((item) => ({
          ...item,
          nombre: capitalize(item.nombre),
        }));
        setCiudades(capitalizedData);
      })
      .catch((err) => console.error('Error cargando ciudades:', err));
  }, [provinciaId]);

  const handlePaisChange = (newPaisId) => {
    setPaisId(newPaisId);
    setProvinciaId(''); // Reseteamos la provincia y ciudad al cambiar de país
    setCiudadId('');
  };

  const handleProvinciaChange = (newProvinciaId) => {
    setProvinciaId(newProvinciaId);
    setCiudadId(''); // Reseteamos la ciudad al cambiar de provincia
  };

  const handleCiudadChange = (newCiudadId) => {
    setCiudadId(newCiudadId);
  };

  const resetUbicacion = () => {
    setPaisId('');
    setProvinciaId('');
    setCiudadId('');
  };

  return {
    paises,
    provincias,
    ciudades,
    paisId,
    provinciaId,
    ciudadId,
    handlePaisChange,
    handleProvinciaChange,
    handleCiudadChange,
    resetUbicacion,
    isProvinciasDisabled: !paisId,
    isCiudadesDisabled: !provinciaId,
  };
};

export default useUbicacion;
