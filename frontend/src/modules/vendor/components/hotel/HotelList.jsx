import { useState } from 'react';
import HotelCard from './HotelCard';
import HotelFilter from './HotelFilter';
import { InnerLoading } from '@/components/ui/InnerLoading';

const HotelList = ({ hoteles, isLoading, error }) => {
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState([]);

  const filteredHotels =
    estrellasSeleccionadas.length === 0
      ? hoteles
      : hoteles.filter((hotel) =>
          estrellasSeleccionadas.includes(Number(hotel.categoria.estrellas))
        );

  if (error) {
    return <p className="text-center text-red-500 bg-red-50 p-4 rounded-xl">{error}</p>;
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
            estrellasSeleccionadas={estrellasSeleccionadas}
            setEstrellasSeleccionadas={setEstrellasSeleccionadas}
          />

          {hoteles.length === 0 ? (
            <section
              className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50"
            >
              <p className="text-gray-500 font-medium">
                Seleccione fechas y destinos para buscar disponibilidad
              </p>
            </section>
          ) : filteredHotels.length === 0 ? (
            <section
              className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50"
            >
              <p className="text-gray-500 font-medium">
                No se encontraron hoteles con los filtros aplicados.
              </p>
            </section>
          ) : (
            <ul className="flex flex-col gap-4">
              {filteredHotels.map((hotel) => (
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
