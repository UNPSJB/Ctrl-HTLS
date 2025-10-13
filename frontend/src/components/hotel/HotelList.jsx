import { useState } from 'react';
import HotelCard from '@ui/cards/HotelCard';
import HotelFilter from './HotelFilter';
import { useHotelsData } from '@/hooks/useHotelsData';

const HotelList = () => {
  const { hoteles, loading, error } = useHotelsData();

  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState([]);

  const filteredHotels =
    estrellasSeleccionadas.length === 0
      ? hoteles
      : hoteles.filter((hotel) =>
          estrellasSeleccionadas.includes(hotel.estrellas)
        );

  // Lógica de renderizado condicional (preparada para el futuro)
  if (loading) {
    return <p>Cargando hoteles...</p>;
  }

  if (error) {
    return <p>Error al cargar los hoteles.</p>;
  }

  const hayHoteles = hoteles.length > 0;

  return (
    <section aria-labelledby="hotel-list-title" className="flex flex-col">
      <h2 id="hotel-list-title" className="sr-only">
        Hoteles disponibles
      </h2>

      {hayHoteles && (
        <HotelFilter
          estrellasSeleccionadas={estrellasSeleccionadas}
          setEstrellasSeleccionadas={setEstrellasSeleccionadas}
        />
      )}

      {filteredHotels.length === 0 ? (
        <section
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="text-gray-500">
            No se encontraron hoteles con las estrellas seleccionadas.
          </p>
        </section>
      ) : (
        <ul className="flex flex-col gap-6">
          {filteredHotels.map((hotel) => (
            <li key={hotel.hotelId}>
              <HotelCard hotel={hotel} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HotelList;
