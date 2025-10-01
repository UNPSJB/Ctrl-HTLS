import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import dateUtils from '../utils/dateUtils';

const { normalizeDateValue } = dateUtils;

const STORAGE_KEY = 'busquedaFilters';

// Estado inicial (usar null para fechas por claridad)
const initialFilters = {
  nombre: '',
  ubicacion: '',
  fechaInicio: null,
  fechaFin: null,
  capacidad: 1,
  estrellas: 0,
};

// Tipos de acción
const TIPOS = {
  ACTUALIZAR_FILTROS: 'ACTUALIZAR_FILTROS',
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  LIMPIAR_FILTROS: 'LIMPIAR_FILTROS',
};

// Reducer
function filtrosReducer(state, action) {
  switch (action.type) {
    case TIPOS.ACTUALIZAR_FILTROS: {
      // payload puede contener cualquier subset; si trae fechas las normalizamos
      const payload = action.payload || {};
      const safe = { ...payload };

      if ('fechaInicio' in payload) {
        safe.fechaInicio = normalizeDateValue(payload.fechaInicio);
      }
      if ('fechaFin' in payload) {
        safe.fechaFin = normalizeDateValue(payload.fechaFin);
      }

      return { ...state, ...safe };
    }

    case TIPOS.SET_DATE_RANGE: {
      const { fechaInicio, fechaFin } = action.payload || {};
      return {
        ...state,
        fechaInicio: normalizeDateValue(fechaInicio),
        fechaFin: normalizeDateValue(fechaFin),
      };
    }

    case TIPOS.LIMPIAR_FILTROS:
      return { ...initialFilters };

    default:
      return state;
  }
}

// Contexto
const BusquedaContext = createContext(undefined);

// Provider
export function BusquedaProvider({ children }) {
  const [persistedFilters, setPersistedFilters] = usePersistedState(
    STORAGE_KEY,
    initialFilters
  );

  // Reducer inicializado con persistedFilters (migrado si hace falta)
  const [filtros, dispatch] = useReducer(filtrosReducer, persistedFilters);

  // Normalizar persisted filters on mount (migración ligera)
  useEffect(() => {
    const normalize = (f = {}) => ({
      ...f,
      fechaInicio: normalizeDateValue(f.fechaInicio),
      fechaFin: normalizeDateValue(f.fechaFin),
      capacidad: f.capacidad ?? initialFilters.capacidad,
      estrellas: f.estrellas ?? initialFilters.estrellas,
    });

    const normalized = normalize(persistedFilters || {});
    if (JSON.stringify(normalized) !== JSON.stringify(persistedFilters)) {
      setPersistedFilters(normalized);
      dispatch({ type: TIPOS.ACTUALIZAR_FILTROS, payload: normalized });
    }
  }, []);

  // Persistir cuando filtros cambian
  useEffect(() => {
    setPersistedFilters(filtros);
  }, [filtros, setPersistedFilters]);

  // Acciones memoizadas
  const actualizarFiltros = useCallback((nuevosFiltros = {}) => {
    // Normalización mínima dentro de la acción (fechas).
    dispatch({ type: TIPOS.ACTUALIZAR_FILTROS, payload: nuevosFiltros });
  }, []);

  const setDateRange = useCallback((fechaInicio, fechaFin) => {
    dispatch({
      type: TIPOS.SET_DATE_RANGE,
      payload: { fechaInicio, fechaFin },
    });
  }, []);

  const limpiarFiltros = useCallback(() => {
    dispatch({ type: TIPOS.LIMPIAR_FILTROS });
  }, []);

  // Selectores/ ayudantes útiles (firma simple)
  const getFilters = useCallback(() => filtros, [filtros]);

  // Memoizar el value
  const value = useMemo(
    () => ({
      filtros,
      actualizarFiltros, // mantiene compatibilidad con tu HotelSearch
      setDateRange, // helper explícito para fechas
      limpiarFiltros,
      getFilters,
    }),
    [filtros, actualizarFiltros, setDateRange, limpiarFiltros, getFilters]
  );

  return (
    <BusquedaContext.Provider value={value}>
      {children}
    </BusquedaContext.Provider>
  );
}

// Hook consumidor
export function useBusqueda() {
  const context = useContext(BusquedaContext);
  if (context === undefined) {
    throw new Error('useBusqueda debe usarse dentro de BusquedaProvider');
  }
  return context;
}
