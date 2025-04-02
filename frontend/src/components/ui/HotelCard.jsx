import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import HabitacionItem from './HabitacionItem';
import PaqueteItem from './PaqueteItem';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);

  // Ruta de la imagen desde assets
  const imagePath = `/src/assets/${encodeURIComponent(hotel.nombre)}.webp`;

  // Alternar selección de habitaciones
  const toggleRoomSelection = (roomName) => {
    setSelectedRooms((prevSelected) =>
      prevSelected.includes(roomName)
        ? prevSelected.filter((name) => name !== roomName)
        : [...prevSelected, roomName]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Encabezado principal */}
      <div
        className="flex cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img
          className="w-48 h-48 object-cover"
          src={imagePath}
          alt={hotel.nombre}
        />
        <div className="flex-1 p-4">
          <h2 className="text-xl font-bold text-gray-800">{hotel.nombre}</h2>
          <p className="text-gray-600 text-sm">
            📍 {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
            {hotel.ubicacion.pais}
          </p>
          <p className="text-gray-700 mt-2 text-sm">{hotel.descripcion}</p>
        </div>
      </div>

      {/* Sección expandible */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Habitaciones Disponibles */}
          <div className="py-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bed className="w-5 h-5" /> Habitaciones Disponibles
            </h3>
            <div className="mt-2 space-y-2">
              {hotel.habitaciones.map((habitacion) => (
                <HabitacionItem
                  key={habitacion.nombre}
                  habitacion={habitacion}
                  isSelected={selectedRooms.includes(habitacion.nombre)}
                  onSelect={toggleRoomSelection}
                />
              ))}
            </div>
          </div>

          {/* Paquetes Turísticos */}
          <div className="py-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" /> Paquetes Turísticos
            </h3>
            <div className="mt-2 space-y-2">
              {hotel.paquetes.map((paquete, index) => (
                <PaqueteItem key={index} paquete={paquete} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
