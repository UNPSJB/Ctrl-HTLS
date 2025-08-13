import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

const useUbicacion = () => {
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisId, setPaisId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [ciudadId, setCiudadId] = useState('');

  useEffect(() => {
    axios
      .get('/paises')
      .then((res) => setPaises(res.data))
      .catch((err) => console.error('Error cargando países:', err));
  }, []);

  useEffect(() => {
    if (!paisId) {
      setProvincias([]);
      setProvinciaId('');
      setCiudadId('');
      return;
    }

    axios
      .get(`/provincias/${paisId}`)
      .then((res) => setProvincias(res.data))
      .catch((err) => console.error('Error cargando provincias:', err));
  }, [paisId]);

  useEffect(() => {
    if (!provinciaId) {
      setCiudades([]);
      setCiudadId('');
      return;
    }

    axios
      .get(`/ciudades/${provinciaId}`)
      .then((res) => setCiudades(res.data))
      .catch((err) => console.error('Error cargando ciudades:', err));
  }, [provinciaId]);

  const handlePaisChange = (newPaisId) => {
    setPaisId(newPaisId);
  };

  const handleProvinciaChange = (newProvinciaId) => {
    setProvinciaId(newProvinciaId);
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
    // Estados
    paises,
    provincias,
    ciudades,
    paisId,
    provinciaId,
    ciudadId,

    // Handlers
    handlePaisChange,
    handleProvinciaChange,
    handleCiudadChange,
    resetUbicacion,

    // Estados de carga/disponibilidad
    isProvinciasDisabled: !paisId,
    isCiudadesDisabled: !provinciaId,
  };
};

export default useUbicacion;
