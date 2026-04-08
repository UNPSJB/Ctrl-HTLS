import { useMemo } from 'react';
import { Bed, Package as PackageIcon, Percent } from 'lucide-react';
import HabitacionCard from './HabitacionCard';
import PaqueteCard from './PaqueteCard';
import Temporada from '@hotel/Temporada';
import { useCarrito } from '@vendor-context/CarritoContext';
import { calcRoomInstanceTotal, calcPackageTotal, calcDescuentoPorCantidad } from '@utils/pricingUtils';
import { capitalizeWords } from '@/utils/stringUtils';

// Componente interno para manejar los cálculos memoizados por cada hotel
function HotelItem({ hotel }) {
  const { removerHabitacion, removerPaquete } = useCarrito();
  const { hotelId, nombre, temporada, habitaciones = [], paquetes = [] } = hotel;

  // Calcula el subtotal por hotel y si aplica descuento por cantidad
  const { subtotalHotel, descuentoInfo } = useMemo(() => {
    let subHabs = 0;
    let subPacks = 0;

    habitaciones.forEach((room) => {
      const calc = calcRoomInstanceTotal({
        precio: room.precio,
        temporada,
        alquiler: { fechaInicio: room.fechaInicio, fechaFin: room.fechaFin },
      });
      subHabs += calc.final;
    });

    const desc = calcDescuentoPorCantidad(habitaciones.length, hotel.descuentos, subHabs);
    subHabs -= desc.montoDescuento;

    paquetes.forEach((pack) => {
      const calc = calcPackageTotal({
        paquete: pack,
        temporada,
      });
      subPacks += calc.final;
    });

    return {
      subtotalHotel: Math.round(subHabs + subPacks),
      descuentoInfo: desc.montoDescuento > 0 ? desc : null,
    };
  }, [hotel, temporada, habitaciones, paquetes]);

  return (
    <article
      className="overflow-hidden rounded-lg bg-white p-5 shadow-lg dark:bg-gray-800"
      aria-labelledby={`hotel-${hotelId}-title`}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2
                id={`hotel-${hotelId}-title`}
                className="text-xl font-bold text-gray-800 dark:text-gray-100"
              >
                {capitalizeWords(nombre ?? 'Hotel')}
              </h2>
              {temporada && (
                <Temporada porcentaje={temporada.porcentaje} tipo={temporada.tipo} />
              )}
            </div>

            {/* Indicador de descuento por cantidad */}
            {descuentoInfo && (
              <div className="mt-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(descuentoInfo.porcentajeAplicado * 100)}% descuento por {habitaciones.length} habitaciones (-${descuentoInfo.montoDescuento})
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Subtotal
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${subtotalHotel}
            </span>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-100 pt-5 dark:border-gray-700">
          {habitaciones.length > 0 && (
            <section aria-labelledby={`hotel-${hotelId}-rooms-title`}>
              <h3
                id={`hotel-${hotelId}-rooms-title`}
                className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100"
              >
                <Bed className="h-5 w-5 text-gray-500" />
                Habitaciones Seleccionadas
              </h3>
              <div className="space-y-3">
                {habitaciones.map((hab, i) => (
                  <HabitacionCard
                    key={hab.id ?? `${hotelId}-hab-${i}`}
                    habitacion={hab}
                    hotel={hotel}
                    onRemove={(cartId) => removerHabitacion(hotel.hotelId, cartId)}
                  />
                ))}
              </div>
            </section>
          )}

          {paquetes.length > 0 && (
            <section aria-labelledby={`hotel-${hotelId}-packages-title`}>
              <h3
                id={`hotel-${hotelId}-packages-title`}
                className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100"
              >
                <PackageIcon className="h-5 w-5 text-gray-500" />
                Paquetes Seleccionados
              </h3>
              <div className="space-y-3">
                {paquetes.map((pkg, i) => (
                  <PaqueteCard
                    key={pkg.id ?? `${hotelId}-pack-${i}`}
                    paquete={pkg}
                    hotel={hotel}
                    onRemove={(cartId) => removerPaquete(hotel.hotelId, cartId)}
                  />
                ))}
              </div>
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
