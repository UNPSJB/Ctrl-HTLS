import { createContext, useContext, useState, useEffect } from 'react';

// Estado inicial de los filtros
const initialFilters = {
  nombre: '',
  ubicacion: '',
  fechaInicio: '',
  fechaFin: '',
  capacidad: 1,
  estrellas: 0,
};

// Creamos el contexto (no lo exportamos directamente)
const BusquedaContext = createContext();

// Hook personalizado para consumir el contexto
export const useBusqueda = () => useContext(BusquedaContext);

// Provider del contexto
export const BusquedaProvider = ({ children }) => {
  // Inicializamos el estado de filtros utilizando datos del localStorage si existen
  const [filtros, setFiltros] = useState(() => {
    const localData = localStorage.getItem('busquedaFilters');
    return localData ? JSON.parse(localData) : initialFilters;
  });

  // Guardamos los filtros en el localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('busquedaFilters', JSON.stringify(filtros));
  }, [filtros]);

  // Función para actualizar los filtros
  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  // Retornamos el provider con los filtros y la función de actualización
  return (
    <BusquedaContext.Provider value={{ filtros, actualizarFiltros }}>
      {children}
    </BusquedaContext.Provider>
  );
};
