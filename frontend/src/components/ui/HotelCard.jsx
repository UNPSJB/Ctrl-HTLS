import { useState } from 'react';
import { Bed, Package, MapPin, ImageOff, Star } from 'lucide-react';
import HabitacionItem from './HabitacionItem';
import PaqueteItem from './PaqueteItem';
import SelectionSummary from './SelectionSummary';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [imageError, setImageError] = useState(false);

  const imagePath = `/src/assets/${encodeURIComponent(hotel.nombre)}.webp`;

  // Función para renderizar estrellas
  const renderStars = (count) => (
    <div className="flex gap-1">
      {Array.from({ length: count }, (_, index) => (
        <Star
          key={index}
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
        />
      ))}
    </div>
  );

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
      {/* Encabezado */}
      <div
        className="flex cursor-pointer gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Imagen del hotel */}
        {imageError ? (
          <div className="w-52 h-52 flex items-center justify-center bg-gray-200 dark:bg-gray-700 ">
            <ImageOff className="w-12 h-12 text-gray-500" />
          </div>
        ) : (
          <img
            className="w-52 h-52 object-cover "
            src={imagePath}
            alt={hotel.nombre}
            onError={() => setImageError(true)}
          />
        )}

        {/* Información del hotel */}
        <div className="flex flex-col flex-1 py-2 gap-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {hotel.nombre}
          </h2>

          {/* Estrellas */}
          <div>{renderStars(hotel.estrellas)}</div>

          {/* Ubicación */}
          <p className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-1">
            <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
            {hotel.ubicacion.pais}
          </p>

          {/* Descripción */}
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {hotel.descripcion}
          </p>
        </div>
      </div>

      {/* Contenido Expandible */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Habitaciones */}
          <div className="py-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
              <Bed className="w-5 h-5" />
              Habitaciones Disponibles
            </h3>
            <div className="space-y-3">
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

          {/* Paquetes */}
          <div className="py-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
              <Package className="w-5 h-5" />
              Paquetes Turísticos
            </h3>
            <div className="space-y-3">
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

          {/* Resumen de selección */}
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
