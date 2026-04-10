import { useState } from 'react';
import HotelCard from './HotelCard';
import HotelFilter from './HotelFilter';
import { InnerLoading } from '@/components/ui/InnerLoading';

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
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/30 dark:bg-red-900/20">
        <p className="font-bold">Error en la búsqueda</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
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
            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Search className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {hasSearched ? 'Sin disponibilidad' : 'Buscador de Disponibilidad'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hasSearched ? 'Búsqueda finalizada' : 'Listo para buscar'}
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {hasSearched 
                      ? 'Lo sentimos, no hemos encontrado habitaciones disponibles para los criterios seleccionados. Intente ajustar las fechas de estancia o seleccionar una ciudad cercana para ampliar los resultados.' 
                      : 'Utilice el buscador superior para encontrar las mejores opciones de alojamiento para sus clientes. Los resultados aparecerán detallados en esta sección.'}
                  </p>
                </div>
              </div>
            </div>
          ) : sortedHotels.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/30">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No hay hoteles que coincidan con los filtros aplicados (categoría/estrellas).
              </p>
            </div>
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
