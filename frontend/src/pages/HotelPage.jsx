import { useParams } from 'react-router-dom';
import hotelsData from '@/data/hotels.json';

const HotelPage = () => {
  const { hotelId } = useParams(); // Recuperamos el ID del hotel desde la URL

  // Buscar el hotel correspondiente en el array de datos
  const hotel = hotelsData.find((h) => h.id === parseInt(hotelId));

  if (!hotel) {
    return <div>Hotel no encontrado</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-text-900">{hotel.name}</h1>
      <p className="text-sm text-text-500">{hotel.location}</p>
      <div className="flex items-center my-2">
        <span className="text-yellow-400">⭐</span>
        <span>{hotel.stars}</span>
      </div>
      <p className="text-sm text-text-600">{hotel.description}</p>
      <div className="mt-4 text-xl font-semibold text-primary-700">
        ${hotel.price} por noche
      </div>
    </div>
  );
};

export default HotelPage;
