import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const capitalize = (str) => {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const useUbicacion = () => {
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisId, setPaisId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [ciudadId, setCiudadId] = useState('');

  // Estados de carga
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  useEffect(() => {
    setLoadingPaises(true);
    axios
      .get('/paises')
      .then((res) => {
        const capitalizedData = res.data.map((item) => ({
          ...item,
          nombre: capitalize(item.nombre),
        }));
        setPaises(capitalizedData);
      })
      .catch((err) => console.error('Error cargando países:', err))
      .finally(() => setLoadingPaises(false));
  }, []);

  useEffect(() => {
    if (!paisId) {
      setProvincias([]);
      setProvinciaId('');
      return;
    }
    setLoadingProvincias(true);
    axios
      .get(`/provincias/${paisId}`)
      .then((res) => {
        const capitalizedData = res.data.map((item) => ({
          ...item,
          nombre: capitalize(item.nombre),
        }));
        setProvincias(capitalizedData);
      })
      .catch((err) => console.error('Error cargando provincias:', err))
      .finally(() => setLoadingProvincias(false));
  }, [paisId]);

  useEffect(() => {
    if (!provinciaId) {
      setCiudades([]);
      setCiudadId('');
      return;
    }
    setLoadingCiudades(true);
    axios
      .get(`/ciudades/${provinciaId}`)
      .then((res) => {
        const capitalizedData = res.data.map((item) => ({
          ...item,
          nombre: capitalize(item.nombre),
        }));
        setCiudades(capitalizedData);
      })
      .catch((err) => console.error('Error cargando ciudades:', err))
      .finally(() => setLoadingCiudades(false));
  }, [provinciaId]);

  const handlePaisChange = (newPaisId) => {
    setPaisId(newPaisId);
    setProvinciaId('');
    setCiudadId('');
  };

  const handleProvinciaChange = (newProvinciaId) => {
    setProvinciaId(newProvinciaId);
    setCiudadId('');
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
    isProvinciasDisabled: !paisId || loadingPaises,
    isCiudadesDisabled: !provinciaId || loadingProvincias,
    loadingPaises,
    loadingProvincias,
    loadingCiudades,
  };
};

export default useUbicacion;
