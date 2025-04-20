import HotelCard from '@ui/cards/HotelCard';
import hotelsData from '@/data/hotels.json';

const HotelList = () => {
  const filteredHotels = hotelsData;

  // Estado vacío: anuncio accesible
  if (filteredHotels.length === 0) {
    return (
      <section
        role="alert"
        aria-live="polite"
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center"
      >
        <p className="text-gray-500">No se encontraron hoteles.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="hotel-list-title" className="flex flex-col gap-5">
      <h2 id="hotel-list-title" className="sr-only">
        Hoteles disponibles
      </h2>
      <ul className="flex flex-col gap-5">
        {filteredHotels.map((hotel) => (
          <li key={hotel.id}>
            <HotelCard hotel={hotel} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HotelList;
