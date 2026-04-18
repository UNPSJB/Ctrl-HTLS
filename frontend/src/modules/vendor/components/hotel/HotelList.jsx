import { useState } from 'react';
import HotelCard from './HotelCard';
import HotelFilter from './HotelFilter';
import { InnerLoading } from '@/components/ui/InnerLoading';
import StateMessage from '@/components/ui/StateMessage';

const HotelList = ({ hoteles, isLoading, error, hasSearched = false }) => {
  const [filters, setFilters] = useState({
    hospedajes: ['A', 'B', 'C'],
    estrellas: 5,
    soloPaquetes: false,
    soloDescuentos: false,
  });

  const parseCategoria = (catStr) => {
    if (!catStr) return { type: 'unknown', value: 0 };
    
    const str = String(catStr).trim().toUpperCase();

    // 1. Detectar si el string ES exactamente A, B o C, o si termina en ellas (ej: "Hospedaje A")
    const letterMatch = str.match(/\b([ABC])\b/); 
    if (letterMatch) {
      return { type: 'letter', value: letterMatch[1] };
    }

    // 2. Si no es letra, intentamos extraer el primer número (ej: "3.5 Estrellas" o "5")
    const numberStr = str.split(' ')[0];
    const val = parseFloat(numberStr);
    
    if (!isNaN(val)) {
      return { type: 'number', value: val };
    }

    return { type: 'unknown', value: 0 };
  };

  const filteredHotels = hoteles.filter((hotel) => {
    if (filters.soloPaquetes && (!hotel.paquetes || hotel.paquetes.length === 0)) return false;
    if (filters.soloDescuentos && (!hotel.descuentos || hotel.descuentos.length === 0)) return false;

    const cat = parseCategoria(hotel.categoria?.estrellas || hotel.estrellas || '');

    if (cat.type === 'letter') {
      return filters.hospedajes.includes(cat.value);
    }

    if (cat.type === 'number') {
      return cat.value <= filters.estrellas; // Filtra para mostrar desde ese numero HASTA abajo.
    }

    return true;
  });

  // Algoritmo de puntuación para ordenamiento (Mejor a Peor)
  const categoryScore = (catStr) => {
    const cat = parseCategoria(catStr);
    if (cat.type === 'number') return cat.value; // Puntuacion 1 a 5
    if (cat.type === 'letter') {
      if (cat.value === 'C') return 0.3; // Mejores hospedajes
      if (cat.value === 'B') return 0.2;
      if (cat.value === 'A') return 0.1; // Peores hospedajes
    }
    return 0; // Desconocidos
  };

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const scoreA = categoryScore(a.categoria?.estrellas || a.estrellas || '');
    const scoreB = categoryScore(b.categoria?.estrellas || b.estrellas || '');
    return scoreB - scoreA; // Orden Descendente
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
