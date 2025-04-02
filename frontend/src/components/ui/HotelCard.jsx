import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import HabitacionItem from './HabitacionItem';
import PaqueteItem from './PaqueteItem';
import SelectionSummary from './SelectionSummary';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);

  const imagePath = `/src/assets/${encodeURIComponent(hotel.nombre)}.webp`;

  const toggleRoomSelection = (roomName) => {
    setSelectedRooms((prevSelected) =>
      prevSelected.includes(roomName)
        ? prevSelected.filter((name) => name !== roomName)
        : [...prevSelected, roomName]
    );
  };

  const togglePackageSelection = (packageName) => {
    setSelectedPackages((prevSelected) =>
      prevSelected.includes(packageName)
        ? prevSelected.filter((name) => name !== packageName)
        : [...prevSelected, packageName]
    );
  };

  const calculateRoomsTotal = () => {
    return hotel.habitaciones
      .filter((hab) => selectedRooms.includes(hab.nombre))
      .reduce((acc, hab) => acc + hab.precio, 0);
  };

  const calculatePackagesTotal = () => {
    return hotel.paquetes
      .filter((paq) => selectedPackages.includes(paq.nombre))
      .reduce((acc, paquete) => {
        const precioOriginal = paquete.habitaciones.reduce(
          (sum, hab) => sum + hab.precio,
          0
        );
        const precioConDescuento =
          precioOriginal - (precioOriginal * paquete.descuento) / 100;
        return acc + precioConDescuento;
      }, 0);
  };

  const totalPrice = calculateRoomsTotal() + calculatePackagesTotal();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {hotel.nombre}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            📍 {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
            {hotel.ubicacion.pais}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
            {hotel.descripcion}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="py-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-3">
              <Bed className="w-5 h-5" />
              Habitaciones Disponibles
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

          <div className="py-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-3">
              <Package className="w-5 h-5" />
              Paquetes Turísticos
            </h3>
            <div className="mt-2 space-y-2">
              {hotel.paquetes.map((paquete) => (
                <PaqueteItem
                  key={paquete.nombre}
                  paquete={paquete}
                  isSelected={selectedPackages.includes(paquete.nombre)}
                  onSelect={togglePackageSelection}
                />
              ))}
            </div>
          </div>

          <SelectionSummary
            selectedRoomsCount={selectedRooms.length}
            selectedPackagesCount={selectedPackages.length}
            totalPrice={totalPrice}
          />
        </div>
      )}
    </div>
  );
};

export default HotelCard;
