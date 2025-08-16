import { useState } from 'react';
import { Bed, Package } from 'lucide-react';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '../HabitacionItem';
import PaqueteItem from '../PaqueteItem';
import SelectionSummary from '../SelectionSummary';
import HotelHeader from '@components/HotelHeader';
import { useCarrito } from '@context/CarritoContext';

function HotelCard({ hotel }) {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleRoomSelection, togglePackageSelection } =
    useHotelSelection(hotel);
  const { carrito, getHotelTotal } = useCarrito();

  const hotelInCart = carrito.hoteles.find((h) => h.idHotel === hotel.id);

  const habitacionesSeleccionadas =
    hotelInCart?.habitaciones.map((hab) => hab.id) || [];
  const paquetesSeleccionados =
    hotelInCart?.paquetes.map((paq) => paq.id) || [];

  const selectedRoomsCount = habitacionesSeleccionadas.length;
  const selectedPackagesCount = paquetesSeleccionados.length;

  const hotelTotals = getHotelTotal(hotel.id);
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
