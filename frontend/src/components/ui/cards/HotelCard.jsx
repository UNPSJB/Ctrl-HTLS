import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '../../hotel/HabitacionItem';
import PaqueteItem from '../../hotel/PaqueteItem';
import SelectionSummary from '../../cart/SelectionSummary';
import HotelHeader from '@components/hotel/HotelHeader';
import { useCarrito } from '@context/CarritoContext';
import { calcularTotalHotel } from '@utils/pricingUtils';

function HotelCard({ hotel }) {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  // Hook que gestiona selección UI local (toggleRoomSelection / togglePackageSelection)
  const { toggleRoomSelection, togglePackageSelection } =
    useHotelSelection(hotel);

  const { carrito } = useCarrito();

  // Objeto del hotel en el carrito (si fue agregado)
  const hotelInCart = carrito.hoteles.find((h) => h.idHotel === hotel.id);

  // Listas de ids seleccionados en el carrito (para marcar checkboxes)
  const habitacionesSeleccionadas =
    hotelInCart?.habitaciones.map((hab) => hab.id) || [];
  const paquetesSeleccionados =
    hotelInCart?.paquetes.map((paq) => paq.id) || [];

  const selectedRoomsCount = habitacionesSeleccionadas.length;
  const selectedPackagesCount = paquetesSeleccionados.length;

  // Si el hotel está en el carrito, calculamos sus totales reales usando pricingUtils
  const hotelTotals = hotelInCart ? calcularTotalHotel(hotelInCart) : null;
  const totalPriceForHotel = hotelTotals?.final ?? 0;
  const hotelEnCarrito = Boolean(hotelInCart);

  const hotelData = {
    idHotel: hotel.id,
    nombre: hotel.nombre,
    descripcion: hotel.descripcion,
    coeficiente: hotel.coeficiente,
    temporada: hotel.temporada,
  };

  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <HotelHeader
        hotel={hotel}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {isExpanded && (
        <>
          <section
            aria-labelledby={`rooms-${hotel.id}-title`}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <h3
              id={`rooms-${hotel.id}-title`}
              className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4"
            >
              <Bed className="w-5 h-5" />
              Habitaciones Disponibles
            </h3>
            <ul className="space-y-3">
              {hotel.habitaciones.map((habitacion) => (
                <li key={habitacion.id}>
                  <HabitacionItem
                    hotelData={hotelData}
                    habitacion={habitacion}
                    isSelected={habitacionesSeleccionadas.includes(
                      habitacion.id
                    )}
                    onSelect={toggleRoomSelection}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby={`packages-${hotel.id}-title`}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <h3
              id={`packages-${hotel.id}-title`}
              className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-4"
            >
              <Package className="w-5 h-5" />
              Paquetes Turísticos
            </h3>
            <ul className="space-y-3">
              {hotel.paquetes.map((paquete) => (
                <li key={paquete.id}>
                  <PaqueteItem
                    hotelData={hotelData}
                    paquete={paquete}
                    isSelected={paquetesSeleccionados.includes(paquete.id)}
                    onSelect={togglePackageSelection}
                  />
                </li>
              ))}
            </ul>
          </section>

          {hotelEnCarrito && (
            <SelectionSummary
              selectedRoomsCount={selectedRoomsCount}
              selectedPackagesCount={selectedPackagesCount}
              totalPrice={totalPriceForHotel}
            />
          )}
        </>
      )}
    </article>
  );
}

export default HotelCard;
