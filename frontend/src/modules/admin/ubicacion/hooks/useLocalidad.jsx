import { useState, useCallback } from 'react';
import axiosInstance from '@/api/axiosInstance';
import toast from 'react-hot-toast';

// Helper para capitalizar nombres (el backend guarda en minúsculas)
const capitalize = (str) => {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const capitalizeList = (list) =>
  list.map((item) => ({ ...item, nombre: capitalize(item.nombre) }));

const useLocalidad = () => {
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // ── FETCH ──────────────────────────────────────────────────────────

  const fetchPaises = useCallback(async () => {
    setLoadingPaises(true);
    try {
      const { data } = await axiosInstance.get('/paises');
      setPaises(capitalizeList(Array.isArray(data) ? data : []));
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor', { id: 'fetch-paises-err' });
      }
      setPaises([]);
    } finally {
      setLoadingPaises(false);
    }
  }, []);

  const fetchProvincias = useCallback(async (paisId) => {
    setLoadingProvincias(true);
    try {
      const { data } = await axiosInstance.get(`/provincias/${paisId}`);
      setProvincias(capitalizeList(Array.isArray(data) ? data : []));
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor', { id: 'fetch-prov-err' });
      }
      setProvincias([]);
    } finally {
      setLoadingProvincias(false);
    }
  }, []);

  const fetchCiudades = useCallback(async (provinciaId) => {
    setLoadingCiudades(true);
    try {
      const { data } = await axiosInstance.get(`/ciudades/${provinciaId}`);
      setCiudades(capitalizeList(Array.isArray(data) ? data : []));
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor', { id: 'fetch-ciu-err' });
      }
      setCiudades([]);
    } finally {
      setLoadingCiudades(false);
    }
  }, []);

  // ── CREATE ─────────────────────────────────────────────────────────

  const crear = useCallback(async (tipo, datos) => {
    setLoadingAction(true);
    try {
      const { data } = await axiosInstance.post('/localidad', { tipo, ...datos });
      toast.success(`${capitalize(tipo)} creado/a correctamente`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || `Error al crear ${tipo}`;
      toast.error(msg);
      throw err;
    } finally {
      setLoadingAction(false);
    }
  }, []);

  // ── UPDATE ─────────────────────────────────────────────────────────

  const editar = useCallback(async (id, tipo, datos) => {
    setLoadingAction(true);
    try {
      const { data } = await axiosInstance.put(`/localidad/${id}`, { tipo, ...datos });
      toast.success(`${capitalize(tipo)} actualizado/a correctamente`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || `Error al actualizar ${tipo}`;
      toast.error(msg);
      throw err;
    } finally {
      setLoadingAction(false);
    }
  }, []);

  // ── DELETE ─────────────────────────────────────────────────────────

  const eliminar = useCallback(async (id, tipo) => {
    setLoadingAction(true);
    try {
      await axiosInstance.delete(`/localidad/${id}`, { data: { tipo } });
      toast.success(`${capitalize(tipo)} eliminado/a correctamente`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || `Error al eliminar ${tipo}`;
      toast.error(msg);
      return false;
    } finally {
      setLoadingAction(false);
    }
  }, []);

  return {
    paises,
    provincias,
    ciudades,
    loadingPaises,
    loadingProvincias,
    loadingCiudades,
    loadingAction,
    fetchPaises,
    fetchProvincias,
    fetchCiudades,
    crear,
    editar,
    eliminar,
  };
};

export default useLocalidad;
