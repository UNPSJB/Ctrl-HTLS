import { useState } from 'react';
import HotelCard from './HotelCard';
import HotelFilter from './HotelFilter';
import { InnerLoading } from '@/components/ui/InnerLoading';
import StateMessage from '@/components/ui/StateMessage';

const HotelList = ({ hoteles, isLoading, error, hasSearched = false }) => {
  const [filters, setFilters] = useState({
    categoriaMaxIndex: 11,
    soloPaquetes: false,
    soloDescuentos: false,
    ordenDescendente: true,
  });

  const parseCategoriaIndex = (catStr) => {
    if (!catStr) return 0;
    
    const str = String(catStr).trim().toUpperCase();

    // 1. Letras A, B, C
    const letterMatch = str.match(/\b([ABC])\b/); 
    if (letterMatch) {
      const letter = letterMatch[1];
      if (letter === 'A') return 0;
      if (letter === 'B') return 1;
      if (letter === 'C') return 2;
    }

    // 2. Números (1 a 5)
    const numberStr = str.split(' ')[0];
    const val = parseFloat(numberStr);
    
    if (!isNaN(val)) {
      // Mapear el número al índice: 1 -> 3, 1.5 -> 4, ..., 5 -> 11
      const idx = (val - 1) * 2 + 3;
      return Math.max(3, Math.min(11, Math.round(idx)));
    }

    return 0; // Desconocido -> peor
  };

  const filteredHotels = hoteles.filter((hotel) => {
    if (filters.soloPaquetes && (!hotel.paquetes || hotel.paquetes.length === 0)) return false;
    if (filters.soloDescuentos && (!hotel.descuentos || hotel.descuentos.length === 0)) return false;

    const catIndex = parseCategoriaIndex(hotel.categoria?.estrellas || hotel.estrellas || '');
    return catIndex <= filters.categoriaMaxIndex;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const indexA = parseCategoriaIndex(a.categoria?.estrellas || a.estrellas || '');
    const indexB = parseCategoriaIndex(b.categoria?.estrellas || b.estrellas || '');
    
    return filters.ordenDescendente 
      ? indexB - indexA // Mejor a peor
      : indexA - indexB; // Peor a mejor
  });

  if (error) {
    return (
      <StateMessage
        variant="error"
        title="Error en la búsqueda"
        description={error}
      />
    );
  }

  const isInitialLoad = isLoading && hoteles.length === 0;

  return (
    <section aria-labelledby="hotel-list-title" className="flex flex-col relative min-h-[300px] gap-4">
      <h2 id="hotel-list-title" className="sr-only">
        Hoteles disponibles
      </h2>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all duration-300 dark:bg-gray-900/40 rounded-xl">
          <InnerLoading message="Buscando disponibilidad..." />
        </div>
      )}

      {isInitialLoad ? (
        <div className="flex-1" />
      ) : (
        <>
          <HotelFilter
            filters={filters}
            setFilters={setFilters}
          />

          {hoteles.length === 0 ? (
            <StateMessage
              variant="info"
              title={hasSearched ? 'Sin disponibilidad' : 'Buscador de Disponibilidad'}
              subtitle={hasSearched ? 'Búsqueda finalizada' : 'Listo para buscar'}
              description={hasSearched 
                ? 'Lo sentimos, no hemos encontrado habitaciones disponibles para los criterios seleccionados. Intente ajustar las fechas de estancia o seleccionar una ciudad cercana para ampliar los resultados.' 
                : 'Utilice el buscador superior para encontrar las mejores opciones de alojamiento para sus clientes. Los resultados aparecerán detallados en esta sección.'}
            />
          ) : sortedHotels.length === 0 ? (
            <StateMessage
              variant="warning"
              title="Sin resultados"
              description="No hay hoteles que coincidan con los filtros aplicados (categoría/estrellas)."
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {sortedHotels.map((hotel) => (
                <li key={hotel.hotelId}>
                  <HotelCard hotel={hotel} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};

export default HotelList;
