import { useMemo } from 'react';
import { Bed, Package as PackageIcon } from 'lucide-react';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import Temporada from '@hotel/Temporada';
import { useCarrito } from '@context/CarritoContext';

function HotelsListView() {
  const { carrito } = useCarrito();
  const hotelsFromContext = carrito?.hoteles ?? [];

  const normalized = useMemo(
    () =>
      (hotelsFromContext || []).map((h) => ({
        idHotel: h.idHotel ?? h.id ?? null,
        nombre: h.nombre ?? h.name ?? 'Hotel',
        temporada: h.temporada ?? h.season ?? '',
        coeficiente: h.coeficiente ?? h.coefficient ?? 0,
        habitaciones: h.habitaciones ?? h.rooms ?? [],
        paquetes: h.paquetes ?? h.packages ?? [],
        totals: h.totals ?? null,
      })),
    [hotelsFromContext]
  );

  if (!normalized.length) return null;

  return (
    <div className="space-y-6">
      {normalized.map((hotelReserva, idx) => {
        const {
          idHotel,
          nombre,
          temporada,
          coeficiente,
          habitaciones = [],
          paquetes = [],
        } = hotelReserva;

        return (
          <article
            key={idHotel ?? idx}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6"
            aria-labelledby={`hotel-${idHotel ?? idx}-title`}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2
                  id={`hotel-${idHotel ?? idx}-title`}
                  className="text-2xl font-bold text-gray-800 dark:text-gray-100"
                >
                  {nombre ?? 'Hotel'}
                </h2>
                {temporada === 'alta' && <Temporada porcentaje={coeficiente} />}
              </div>

              {habitaciones.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <Bed className="w-5 h-5" />
                    Habitaciones Seleccionadas
                  </h3>
                  <div className="space-y-4">
                    {habitaciones.map((hab, i) => (
                      <HabitacionCard
                        key={hab.id ?? `${idHotel}-hab-${i}`}
                        habitacion={hab}
                        porcentaje={coeficiente}
                      />
                    ))}
                  </div>
                </section>
              )}

              {paquetes.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <PackageIcon className="w-5 h-5" />
                    Paquetes Seleccionados
                  </h3>
                  <div className="space-y-4">
                    {paquetes.map((pack, i) => (
                      <PaqueteCard
                        key={pack.id ?? `${idHotel}-pack-${i}`}
                        paquete={pack}
                        porcentaje={coeficiente}
                      />
                    ))}
                  </div>
                </section>
              )}

              <Resumen
                habitaciones={habitaciones}
                paquetes={paquetes}
                porcentaje={coeficiente}
                isHighSeason={temporada === 'alta'}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default HotelsListView;
