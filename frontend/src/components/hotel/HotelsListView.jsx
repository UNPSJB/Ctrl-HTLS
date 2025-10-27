import { Bed, Package as PackageIcon } from 'lucide-react';
import HabitacionCard from '@ui/cards/HabitacionCard'; // Usando tu versión de solo vista
import PaqueteCard from '@ui/cards/PaqueteCard'; // Usando la nueva versión de solo vista
import Temporada from '@hotel/Temporada';
import { useCarrito } from '@context/CarritoContext';

function HotelsListView() {
  const { carrito } = useCarrito();
  const hotels = Array.isArray(carrito?.hoteles) ? carrito.hoteles : [];

  return (
    <div className="space-y-6">
      {hotels.map((hotel, hotelIndex) => {
        const { idHotel, nombre, temporada, habitaciones, paquetes } = hotel;

        return (
          <article
            key={idHotel ?? `hotel-${hotelIndex}`}
            className="overflow-hidden rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
            aria-labelledby={`hotel-${idHotel ?? hotelIndex}-title`}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2
                  id={`hotel-${idHotel ?? hotelIndex}-title`}
                  className="text-2xl font-bold text-gray-800 dark:text-gray-100"
                >
                  {nombre ?? 'Hotel'}
                </h2>
                {temporada?.tipo === 'alta' && (
                  <Temporada porcentaje={temporada.porcentaje} />
                )}
              </div>

              {habitaciones.length > 0 && (
                <section aria-labelledby={`hotel-${idHotel}-rooms-title`}>
                  <h3
                    id={`hotel-${idHotel}-rooms-title`}
                    className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
                  >
                    <Bed className="h-5 w-5" />
                    Habitaciones Seleccionadas
                  </h3>
                  <div className="space-y-4">
                    {habitaciones.map((hab, i) => (
                      <HabitacionCard
                        key={hab.id ?? `${idHotel}-hab-${i}`}
                        habitacion={hab}
                        hotel={hotel}
                      />
                    ))}
                  </div>
                </section>
              )}

              {paquetes.length > 0 && (
                <section aria-labelledby={`hotel-${idHotel}-packages-title`}>
                  <h3
                    id={`hotel-${idHotel}-packages-title`}
                    className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
                  >
                    <PackageIcon className="h-5 w-5" />
                    Paquetes Seleccionados
                  </h3>
                  <div className="space-y-4">
                    {paquetes.map((pkg, i) => (
                      <PaqueteCard
                        key={pkg.id ?? `${idHotel}-pack-${i}`}
                        paquete={pkg}
                        hotel={hotel}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default HotelsListView;
