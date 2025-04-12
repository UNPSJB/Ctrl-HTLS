import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '../HabitacionItem';
import PaqueteItem from '../PaqueteItem';
import SelectionSummary from '../SelectionSummary';
import HotelHeader from '@components/HotelHeader';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    selectedRooms,
    selectedPackages,
    toggleRoomSelection,
    togglePackageSelection,
    totalPrice,
    discountCoefficient,
  } = useHotelSelection(hotel);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <HotelHeader
        hotel={hotel}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        imageError={imageError}
        setImageError={setImageError}
      />

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="py-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
              <Bed className="w-5 h-5" />
              Habitaciones Disponibles
            </h3>
            <div className="space-y-3">
              {hotel.habitaciones.map((habitacion) => (
                <HabitacionItem
                  key={habitacion.id} // Usamos id en lugar de nombre
                  idHotel={hotel.id}
                  habitacion={habitacion}
                  coeficiente={discountCoefficient}
                  temporada={hotel.temporada}
                  coeficienteHotel={hotel.coeficiente}
                  isSelected={selectedRooms.includes(habitacion.id)} // Comprobamos con id
                  onSelect={toggleRoomSelection}
                />
              ))}
            </div>
          </div>

          <div className="py-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4">
              <Package className="w-5 h-5" />
              Paquetes Turísticos
            </h3>
            <div className="space-y-3">
              {hotel.paquetes.map((paquete) => (
                <PaqueteItem
                  key={paquete.id} // Usamos id en lugar de nombre
                  idHotel={hotel.id}
                  paquete={paquete}
                  coeficiente={discountCoefficient}
                  temporada={hotel.temporada}
                  coeficienteHotel={hotel.coeficiente}
                  isSelected={selectedPackages.includes(paquete.id)} // Comprobamos con id
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
