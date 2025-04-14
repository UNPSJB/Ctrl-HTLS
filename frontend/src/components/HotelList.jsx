import HotelCard from '@ui/cards/HotelCard';
import hotelsData from '@/data/hotels.json';

const HotelList = () => {
  // Se ignoran los filtros y se muestran todos los hoteles
  const filteredHotels = hotelsData;

  // Si no hay hoteles (por cualquier motivo), se muestra un mensaje
  if (filteredHotels.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">No se encontraron hoteles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {filteredHotels.map((hotel, index) => (
        <HotelCard key={index} hotel={hotel} />
      ))}
    </div>
  );
};

export default HotelList;
