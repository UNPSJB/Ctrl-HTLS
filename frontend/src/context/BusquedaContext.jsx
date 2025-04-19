import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

// Estado inicial de los filtros
const initialFilters = {
  nombre: '',
  ubicacion: '',
  fechaInicio: '',
  fechaFin: '',
  capacidad: 1,
  estrellas: 0,
};

// Tipos de acción
const TIPOS = {
  ACTUALIZAR_FILTROS: 'ACTUALIZAR_FILTROS',
  LIMPIAR_FILTROS: 'LIMPIAR_FILTROS',
};

// Reducer para los filtros
function filtrosReducer(state, action) {
  switch (action.type) {
    case TIPOS.ACTUALIZAR_FILTROS:
      return { ...state, ...action.payload };
    case TIPOS.LIMPIAR_FILTROS:
      return { ...initialFilters };
    default:
      return state;
  }
}

// Crear contexto
const BusquedaContext = createContext(undefined);

// Provider
export function BusquedaProvider({ children }) {
  // Persistencia con usePersistedState
  const [persistedFilters, setPersistedFilters] = usePersistedState(
    'busquedaFilters',
    initialFilters
  );

  // useReducer con estado inicial persistido
  const [filtros, dispatch] = useReducer(filtrosReducer, persistedFilters);

  // Sincronizar cambios con localStorage
  useEffect(() => {
    setPersistedFilters(filtros);
  }, [filtros, setPersistedFilters]);

  // Acciones memoizadas
  const actualizarFiltros = useCallback(
    (nuevosFiltros) =>
      dispatch({ type: TIPOS.ACTUALIZAR_FILTROS, payload: nuevosFiltros }),
    []
  );

  const limpiarFiltros = useCallback(
    () => dispatch({ type: TIPOS.LIMPIAR_FILTROS }),
    []
  );

  // Memoizar el value para evitar renders innecesarios
  const value = useMemo(
    () => ({ filtros, actualizarFiltros, limpiarFiltros }),
    [filtros, actualizarFiltros, limpiarFiltros]
  );

  return (
    <BusquedaContext.Provider value={value}>
      {children}
    </BusquedaContext.Provider>
  );
}

// Hook para consumir el contexto
export function useBusqueda() {
  const context = useContext(BusquedaContext);
  if (context === undefined) {
    throw new Error('useBusqueda debe usarse dentro de BusquedaProvider');
  }
  return context;
}
