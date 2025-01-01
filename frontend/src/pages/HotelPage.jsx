import { useParams } from 'react-router-dom';
import hotelsData from '@/data/hotels.json';
import roomsData from '@/data/rooms.json'; // Importa el archivo de habitaciones
import RoomCard from '@/components/ui/RoomCard';
import { FaMapMarkerAlt, FaStar, FaStarHalfAlt } from 'react-icons/fa'; // Iconos de ubicación y estrellas

const HotelPage = () => {
  const { hotelId } = useParams(); // Recuperamos el ID del hotel desde la URL

  // Buscar el hotel correspondiente en el array de datos
  const hotel = hotelsData.find((h) => h.id === parseInt(hotelId));

  if (!hotel) {
    return (
      <div className="text-primary-700 text-center p-4">
        <h2 className="text-title-lg font-bold">Hotel no encontrado</h2>
        <p className="text-body-md mt-2">
          Por favor, verifica el ID del hotel e inténtalo de nuevo.
        </p>
      </div>
    );
  }

  // Función para renderizar estrellas
  const renderStars = (stars) => {
    const fullStars = Math.floor(stars); // Número entero de estrellas completas
    const hasHalfStar = stars % 1 !== 0; // Verifica si hay media estrella
    const starIcons = [];

    // Agregar estrellas completas
    for (let i = 0; i < fullStars; i++) {
      starIcons.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    // Agregar media estrella si corresponde
    if (hasHalfStar) {
      starIcons.push(
        <FaStarHalfAlt key="half-star" className="text-yellow-400" />
      );
    }

    return starIcons;
  };

  return (
    <div className="min-h-screen flex flex-col gap-6">
      {/* Fila 1: Imagen de fondo con nombre, ubicación y estrellas */}
      <div
        className="relative bg-cover bg-center h-64 flex items-end text-white rounded-t-lg"
        style={{ backgroundImage: `url(${hotel.image})` }}
      >
        <div className="bg-gradient-to-t from-black/70 to-transparent w-full p-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            {hotel.name}
          </h1>
          <div className="flex items-center text-body-md">
            <FaMapMarkerAlt className="mr-2" />
            <span>{hotel.location}</span>
          </div>
          <div className="flex items-center mt-2 space-x-1">
            {renderStars(hotel.stars)}
          </div>
        </div>
      </div>

      {/* Fila 2: Bienvenida y descripción */}
      <div className="text-text-700 flex-grow">
        <h2 className="text-2xl font-semibold">Bienvenido al {hotel.name}</h2>
        <p className="mt-2 text-body-md">{hotel.description}</p>
      </div>

      {/* Fila 3: Habitaciones */}
      <div className="text-primary-700 flex-grow">
        <h3 className="text-xl font-bold">Habitaciones</h3>
        <div className="flex overflow-x-auto space-x-4 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-primary-100">
          {roomsData.map((room, index) => (
            <RoomCard key={index} {...room} />
          ))}
        </div>
      </div>

      {/* Fila 4: Información del encargado */}
      <div className="text-secondary-500 flex-grow">
        <h3 className="text-xl font-bold">Encargado</h3>
        <p className="text-body-md">Próximamente...</p>
      </div>
    </div>
  );
};

export default HotelPage;
