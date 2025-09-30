import { useState, useMemo } from 'react';
import { Bed, Package } from 'lucide-react';
import { transformHotel } from '@/hooks/hotelTransformer';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '../../hotel/HabitacionItem';
import PaqueteItem from '../../hotel/PaqueteItem';
import HotelHeader from '@components/hotel/HotelHeader';
import Descuento from '@ui/Descuento';

function HotelCard({ hotel }) {
  const hotelTransformed = useMemo(() => {
    return transformHotel(hotel);
  }, [hotel]);

  // Estado local: manejar la expansión/colapso de la tarjeta
  const [isExpanded, setIsExpanded] = useState(false);

  // Hook para gestionar el estado de selección del carrito y cálculos
  const {
    selectedRooms,
    selectedPackages,
    toggleRoomSelection,
    togglePackageSelection,
    totalPrice,
    discountCoefficient,
    hotelEnCarrito,
  } = useHotelSelection(hotelTransformed);

  const hotelInCart = hotelEnCarrito;

  return (
    <article className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:hover:from-gray-800 dark:hover:to-blue-900/20">
      <HotelHeader
        hotel={hotelTransformed}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        totalPrice={totalPrice}
        discountCoefficient={discountCoefficient}
      />

      {/* Contenido expandible (Habitaciones y Paquetes) */}
      {isExpanded && (
        <>
          <section
            aria-labelledby={`rooms-${hotelTransformed.hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3
                id={`rooms-${hotelTransformed.hotelId}-title`}
                className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
              >
                <Bed className="h-5 w-5" />
                Habitaciones Disponibles
              </h3>

              {Array.isArray(hotelTransformed.formatearDescuentos) &&
                hotelTransformed.formatearDescuentos.map((descuento) => (
                  <Descuento key={descuento.id} descuento={descuento} />
                ))}
            </div>

            <ul className="space-y-3">
              {hotelTransformed.habitaciones.map((group) => (
                <li key={`${hotelTransformed.hotelId}-${group.tipo}`}>
                  <HabitacionItem
                    hotelData={hotelTransformed.hotelData}
                    habitacionGroup={group}
                    hotelInCart={hotelInCart}
                    selectedRooms={selectedRooms}
                    onToggleRoom={toggleRoomSelection}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby={`packages-${hotelTransformed.hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <h3
              id={`packages-${hotelTransformed.hotelId}-title`}
              className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
            >
              <Package className="h-5 w-5" />
              Paquetes Turísticos
            </h3>
            <ul className="space-y-3">
              {Array.isArray(hotelTransformed.paquetes) &&
              hotelTransformed.paquetes.length > 0 ? (
                hotelTransformed.paquetes.map((paquete) => (
                  <li key={paquete.id}>
                    <PaqueteItem
                      hotelData={hotelTransformed.hotelData}
                      paquete={paquete}
                      isSelected={selectedPackages.includes(paquete.id)}
                      onSelect={() => togglePackageSelection(paquete.id)}
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
