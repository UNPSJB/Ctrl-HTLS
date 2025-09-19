import HotelCard from '@ui/cards/HotelCard';
import hotelsData from '@/data/hotels.json';

const HotelList = () => {
  const filteredHotels = hotelsData;

  if (filteredHotels.length === 0) {
    return (
      <section
        role="alert"
        aria-live="polite"
        className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <p className="text-gray-500">No se encontraron hoteles.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="hotel-list-title" className="flex flex-col">
      <h2 id="hotel-list-title" className="sr-only">
        Hoteles disponibles
      </h2>
      <ul className="flex flex-col gap-6">
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
