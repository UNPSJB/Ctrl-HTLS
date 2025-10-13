import { useState } from 'react';
import HotelCard from '@ui/cards/HotelCard';
import HotelFilter from './HotelFilter';

// Recibe hoteles, isLoading y error como props desde HomePage
const HotelList = ({ hoteles, isLoading, error }) => {
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState([]);

  // La lógica de filtrado se mantiene igual
  const filteredHotels =
    estrellasSeleccionadas.length === 0
      ? hoteles
      : hoteles.filter((hotel) =>
          estrellasSeleccionadas.includes(Number(hotel.categoria.estrellas))
        );

  // Manejo de estados de carga y error de la API
  if (isLoading) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Buscando hoteles...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Si no hay hoteles después de una búsqueda exitosa
  if (hoteles.length === 0) {
    return (
      <section
        role="alert"
        aria-live="polite"
        className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <p className="text-gray-500">
          No se encontraron hoteles con los criterios seleccionados.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="hotel-list-title" className="flex flex-col">
      <h2 id="hotel-list-title" className="sr-only">
        Hoteles disponibles
      </h2>

      <HotelFilter
        estrellasSeleccionadas={estrellasSeleccionadas}
        setEstrellasSeleccionadas={setEstrellasSeleccionadas}
      />

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
