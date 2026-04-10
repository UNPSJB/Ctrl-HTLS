import { useState, useMemo } from 'react';
import { Bed, Package } from 'lucide-react';
import useHotelSelection from '@vendor-hooks/useHotelSelection';
import HabitacionItem from './HabitacionItem';
import PaqueteItem from './PaqueteItem';
import HotelHeader from './HotelHeader';
import Descuento from '@ui/Descuento';
import { transformHotel } from '@admin-hooks/hotelTransformer';

// Tarjeta interactiva de hotel con selección de habitaciones y paquetes
function HotelCard({ hotel: rawHotel }) {

  const hotel = useMemo(() => transformHotel(rawHotel), [rawHotel]);
  const [isExpanded, setIsExpanded] = useState(false);

  const { addRoom, removeRoom, addPackage, removePackage } =
    useHotelSelection(hotel);

  if (!hotel) return null;

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 dark:border-gray-700 dark:bg-gray-800">
      <HotelHeader
        hotel={hotel}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {isExpanded && (
        <>
          { }
          <section
            aria-labelledby={`rooms-${hotel.hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="mb-4 flex items-center gap-3">
              <h3
                id={`rooms-${hotel.hotelId}-title`}
                className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
              >
                <Bed className="h-5 w-5" />
                Habitaciones Disponibles
              </h3>
            </div>
            <ul className="space-y-3">
              {hotel.habitaciones.map((habitacionTipo) => (
                <li key={`${hotel.hotelId}-${habitacionTipo.tipo}`}>
                  <HabitacionItem
                    hotelData={hotel}
                    habitacionTipo={habitacionTipo}
                    onAdd={addRoom}
                    onRemove={removeRoom}
                  />
                </li>
              ))}
            </ul>
          </section>

          { }
          <section
            aria-labelledby={`packages-${hotel.hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <h3
              id={`packages-${hotel.hotelId}-title`}
              className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
            >
              <Package className="h-5 w-5" />
              Paquetes Turísticos
            </h3>
            <ul className="space-y-3">
              {hotel.paquetes.length > 0 ? (
                hotel.paquetes.map((paqueteGroup) => (
                  <li key={`${hotel.hotelId}-${paqueteGroup.nombre}`}>
                    <PaqueteItem
                      hotelData={hotel}
                      paqueteGroup={paqueteGroup}
                      onAdd={addPackage}
                      onRemove={removePackage}
                    />
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-600 dark:text-gray-400">
                  No hay paquetes disponibles.
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </article>
  );
}

export default HotelCard;
