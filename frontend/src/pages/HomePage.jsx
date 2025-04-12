import { useState } from 'react';
import HotelSearch from '@components/HotelSearch';
import HotelList from '@components/HotelList';

const HomePage = () => {
  // Estado para almacenar los filtros de búsqueda. Inicialmente es null.
  const [filters, setFilters] = useState(null);

  return (
    <div className="container flex flex-col gap-10">
      {/* Componente de búsqueda que actualiza los filtros */}
      <HotelSearch onSearch={setFilters} />
      {/* Componente de listado que filtra los hoteles según los filtros */}
      <HotelList filters={filters} />
    </div>
  );
};

export default HomePage;
