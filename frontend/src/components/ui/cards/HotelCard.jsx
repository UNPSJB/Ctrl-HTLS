import { useState, useMemo, useCallback } from 'react';
import { Bed, Package } from 'lucide-react';
import { transformHotel } from '@/hooks/hotelTransformer';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '../../hotel/HabitacionItem';
import PaqueteItem from '../../hotel/PaqueteItem';
import HotelHeader from '@components/hotel/HotelHeader';
import Descuento from '@ui/Descuento';

function HotelCard({ hotel }) {
  // Transformación (normalización, shape conveniente para la UI)
  const hotelTransformed = useMemo(() => transformHotel(hotel), [hotel]);

  // Control de expansión de la tarjeta
  const [isExpanded, setIsExpanded] = useState(false);

  // Hook centralizado que maneja selección, totales y handlers memoizados
  const {
    selectedRoomIds,
    selectedRoomIdsSet,
    selectedPackages,
    addRoom,
    removeRoom,
    addPackage,
    removePackage,
    totalPrice,
    discountCoefficient,
  } = useHotelSelection(hotelTransformed);

  // Handler memoizado para alternar selección de paquete (lo pasamos a PaqueteItem)
  const handleTogglePackage = useCallback(
    (pkg) => {
      // Si ya está seleccionado, lo removemos; si no, lo agregamos.
      const isSelected = selectedPackages.includes(pkg.id);
      if (isSelected) {
        removePackage(pkg.id);
      } else {
        addPackage(pkg);
      }
    },
    [selectedPackages, addPackage, removePackage]
  );

  return (
    <article className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800">
      <HotelHeader
        hotel={hotelTransformed}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        totalPrice={totalPrice}
        discountCoefficient={discountCoefficient}
      />

      {/* Contenido expandible: Habitaciones y Paquetes */}
      {isExpanded && (
        <>
          {/* Habitaciones */}
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

              {/* Descuentos (badges) */}
              {Array.isArray(hotelTransformed.descuentos) &&
                hotelTransformed.descuentos.map((descuento) => (
                  <Descuento key={descuento.id} descuento={descuento} />
                ))}
            </div>

            <ul className="space-y-3">
              {Array.isArray(hotelTransformed.habitaciones) &&
              hotelTransformed.habitaciones.length > 0 ? (
                hotelTransformed.habitaciones.map((group) => (
                  <li key={`${hotelTransformed.hotelId}-${group.tipo}`}>
                    <HabitacionItem
                      hotelData={hotelTransformed}
                      habitacionGroup={group}
                      selectedIds={selectedRoomIds}
                      selectedIdsSet={selectedRoomIdsSet}
                      onAdd={(roomObj) => addRoom(roomObj)}
                      onRemove={(roomId) => removeRoom(roomId)}
                    />
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-600 dark:text-gray-400">
                  No hay habitaciones disponibles.
                </li>
              )}
            </ul>
          </section>

          {/* Paquetes */}
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
                      hotelData={hotelTransformed}
                      paquete={paquete}
                      isSelected={selectedPackages.includes(paquete.id)}
                      onSelect={() => handleTogglePackage(paquete)}
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
