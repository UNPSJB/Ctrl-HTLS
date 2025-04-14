import { createContext, useState, useEffect } from 'react';

// Estado inicial de los filtros
const initialFilters = {
  nombre: '',
  ubicacion: '',
  fechaInicio: '',
  fechaFin: '',
  capacidad: 1,
  estrellas: 0,
};

export const BusquedaContext = createContext();

export const BusquedaProvider = ({ children }) => {
  // Inicializamos el estado leyendo del localStorage si existe
  const [filtros, setFiltros] = useState(() => {
    const localData = localStorage.getItem('busquedaFilters');
    return localData ? JSON.parse(localData) : initialFilters;
  });

  // Cada vez que los filtros cambian, se actualiza el localStorage
  useEffect(() => {
    localStorage.setItem('busquedaFilters', JSON.stringify(filtros));
  }, [filtros]);

  // Función para actualizar los filtros
  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  return (
    <BusquedaContext.Provider value={{ filtros, actualizarFiltros }}>
      {children}
    </BusquedaContext.Provider>
  );
};
