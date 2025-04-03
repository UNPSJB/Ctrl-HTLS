import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import HabitacionItem from './HabitacionItem';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null; // Evita errores si no hay datos

  const [isExpanded, setIsExpanded] = useState(false); // Estado de expansión
  const [selectedRooms, setSelectedRooms] = useState([]); // Estado de habitaciones seleccionadas

  // Ruta de la imagen desde assets
  const imagePath = `/src/assets/${encodeURIComponent(hotel.nombre)}.webp`;

  // Alternar selección de habitaciones
  const toggleRoomSelection = (roomName) => {
    setSelectedRooms(
      (prevSelected) =>
        prevSelected.includes(roomName)
          ? prevSelected.filter((name) => name !== roomName) // Desmarcar
          : [...prevSelected, roomName] // Marcar
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Contenedor principal (click para expandir) */}
      <div
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex">
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
          </div>
        </div>
      </div>

      {/* Sección expandible (permanece dentro del mismo div) */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Habitaciones Disponibles */}
          <div className="py-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bed className="w-5 h-5" /> Habitaciones Disponibles
            </h3>
            <div className="mt-2 space-y-4">
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

          {/* Paquete Turístico */}
          <div className="py-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" /> Paquetes Turísticos
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
