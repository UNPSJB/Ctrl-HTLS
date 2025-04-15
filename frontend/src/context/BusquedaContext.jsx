import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Estado inicial de los filtros
const initialFilters = {
  nombre: '',
  ubicacion: '',
  fechaInicio: '',
  fechaFin: '',
  capacidad: 1,
  estrellas: 0,
};

// Crear contexto
const BusquedaContext = createContext(undefined);

// Provider
export function BusquedaProvider({ children }) {
  const [filtros, setFiltros] = useState(() => {
    try {
      const localData = localStorage.getItem('busquedaFilters');
      return localData ? JSON.parse(localData) : initialFilters;
    } catch {
      return initialFilters;
    }
  });

  useEffect(() => {
    localStorage.setItem('busquedaFilters', JSON.stringify(filtros));
  }, [filtros]);

  // Actualizar filtros
  const actualizarFiltros = (nuevosFiltros) => setFiltros(nuevosFiltros);

  // Memoizar el value para evitar renders innecesarios
  const value = useMemo(() => ({ filtros, actualizarFiltros }), [filtros]);

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
