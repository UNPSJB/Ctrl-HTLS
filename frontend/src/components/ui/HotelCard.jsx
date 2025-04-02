import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import HabitacionItem from './HabitacionItem';
import PaqueteItem from './PaqueteItem';
import SelectionSummary from './SelectionSummary';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  // Estado de habitaciones seleccionadas
  const [selectedRooms, setSelectedRooms] = useState([]);
  // Estado de paquetes seleccionados
  const [selectedPackages, setSelectedPackages] = useState([]);

  // Ruta de la imagen
  const imagePath = `/src/assets/${encodeURIComponent(hotel.nombre)}.webp`;

  // Alternar selección de habitaciones
  const toggleRoomSelection = (roomName) => {
    setSelectedRooms((prevSelected) =>
      prevSelected.includes(roomName)
        ? prevSelected.filter((name) => name !== roomName)
        : [...prevSelected, roomName]
    );
  };

  // Alternar selección de paquetes
  const togglePackageSelection = (packageName) => {
    setSelectedPackages((prevSelected) =>
      prevSelected.includes(packageName)
        ? prevSelected.filter((name) => name !== packageName)
        : [...prevSelected, packageName]
    );
  };

  // Función para calcular el total de las habitaciones seleccionadas
  const calculateRoomsTotal = () => {
    return hotel.habitaciones
      .filter((hab) => selectedRooms.includes(hab.nombre))
      .reduce((acc, hab) => acc + hab.precio, 0);
  };

  // Función para calcular el total de los paquetes seleccionados (precio con descuento)
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

  // Total final de todo lo seleccionado
  const totalPrice = calculateRoomsTotal() + calculatePackagesTotal();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Encabezado principal (click para expandir/contraer) */}
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

          {/* Resumen de la Selección */}
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
