import { useState } from 'react';
import { Bed, Package as PackageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import HabitacionCard from './HabitacionCard';
import PaqueteCard from './PaqueteCard';
import Temporada from '@hotel/Temporada';
import Descuento from '@ui/Descuento';
import { useCarrito } from '@vendor-context/CarritoContext';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatCurrency } from '@utils/pricingUtils';

// Componente interno para mostrar un hotel con sus ítems en la vista de pago
function HotelItem({ hotel }) {
  const { removerHabitacion, removerPaquete } = useCarrito();
  const { porHotel } = useCarritoPrecios();
  const { hotelId, nombre, temporada, habitaciones = [], paquetes = [] } = hotel;

  const [roomsExpanded, setRoomsExpanded] = useState(true);
  const [packagesExpanded, setPackagesExpanded] = useState(true);

  // Obtener datos del hook centralizado
  const hotelBreakdown = porHotel[hotelId];
  const subtotalHotel = hotelBreakdown?.subtotalHotel ?? 0;
  const tieneDescuento = hotelBreakdown && hotelBreakdown.descuentoCantidad > 0;

  return (
    <article
      className="overflow-hidden rounded-lg bg-white p-5 shadow-lg dark:bg-gray-800"
      aria-labelledby={`hotel-${hotelId}-title`}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id={`hotel-${hotelId}-title`}
              className="text-xl font-bold text-gray-800 dark:text-gray-100"
            >
              {capitalizeWords(nombre ?? 'Hotel')}
            </h2>

            {/* Descuentos agrupados (Fila 2) */}
            {(temporada || tieneDescuento) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {temporada && (
                  <Temporada porcentaje={temporada.porcentaje} tipo={temporada.tipo} />
                )}
                {tieneDescuento && (
                  <Descuento
                    descuento={{
                      porcentaje: hotelBreakdown.porcentajeDescCantidad,
                      cantidad_de_habitaciones: hotelBreakdown.cantidadHabs
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Monto Total
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(subtotalHotel)}
            </span>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-100 pt-5 dark:border-gray-700">
          {habitaciones.length > 0 && (
            <section aria-labelledby={`hotel-${hotelId}-rooms-title`}>
              <div className="mb-3 flex items-center justify-between">
                <h3
                  id={`hotel-${hotelId}-rooms-title`}
                  className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100"
                >
                  <Bed className="h-5 w-5 text-gray-500" />
                  Habitaciones Seleccionadas
                </h3>
                <button
                  onClick={() => setRoomsExpanded(!roomsExpanded)}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {roomsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {roomsExpanded && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {habitaciones.map((hab, i) => (
                    <HabitacionCard
                      key={hab.id ?? `${hotelId}-hab-${i}`}
                      habitacion={hab}
                      hotel={hotel}
                      onRemove={(cartId) => removerHabitacion(hotel.hotelId, cartId)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {paquetes.length > 0 && (
            <section aria-labelledby={`hotel-${hotelId}-packages-title`}>
              <div className="mb-3 flex items-center justify-between">
                <h3
                  id={`hotel-${hotelId}-packages-title`}
                  className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100"
                >
                  <PackageIcon className="h-5 w-5 text-gray-500" />
                  Paquetes Seleccionados
                </h3>
                <button
                  onClick={() => setPackagesExpanded(!packagesExpanded)}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {packagesExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {packagesExpanded && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {paquetes.map((pkg, i) => (
                    <PaqueteCard
                      key={pkg.id ?? `${hotelId}-pack-${i}`}
                      paquete={pkg}
                      hotel={hotel}
                      onRemove={(cartId) => removerPaquete(hotel.hotelId, cartId)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

function HotelsListView() {
  const { carrito } = useCarrito();
  const hotels = Array.isArray(carrito?.hoteles) ? carrito.hoteles : [];

  return (
    <div className="space-y-6">
      {hotels.map((hotel, index) => (
        <HotelItem key={hotel.hotelId ?? `hotel-${index}`} hotel={hotel} />
      ))}
    </div>
  );
}

export default HotelsListView;
