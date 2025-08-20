import { Bed, Package } from 'lucide-react';
import { useMemo } from 'react';
import { useCarrito } from '@context/CarritoContext';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import ResumenPago from '@components/ResumenPago';
import Temporada from '@components/Temporada';
import { calcularTotalReserva } from '@utils/pricingUtils';

function PagoPage() {
  const { carrito } = useCarrito();

  // Mapear hoteles para mostrar (igual que en ReservaPage)
  const hotelsData = useMemo(
    () =>
      (carrito.hoteles || []).map((h) => {
        const habitaciones = h.habitaciones ?? [];
        const paquetes = h.paquetes ?? [];
        const isHighSeason = (h.temporada ?? '') === 'alta';
        const totals = calcularTotalReserva(
          habitaciones,
          paquetes,
          isHighSeason,
          h.coeficiente ?? 0
        );
        return {
          idHotel: h.idHotel,
          nombre: h.nombre,
          temporada: h.temporada,
          coeficiente: h.coeficiente ?? 0,
          habitaciones,
          paquetes,
          totals,
        };
      }),
    [carrito.hoteles]
  );

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Confirmar y Pagar
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Revisá los detalles antes de procesar el pago.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* columna principal: igual a ReservaPage */}
        <div className="lg:col-span-2 space-y-6">
          {hotelsData.map((hotelReserva, idx) => {
            const {
              nombre,
              temporada,
              coeficiente,
              habitaciones = [],
              paquetes = [],
            } = hotelReserva;

            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6 mb-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {nombre ?? 'Hotel'}
                  </h2>
                  {temporada === 'alta' && (
                    <Temporada porcentaje={coeficiente} />
                  )}
                </div>

                {/* Habitaciones */}
                {habitaciones.length > 0 && (
                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                      <Bed className="w-5 h-5" />
                      Habitaciones Seleccionadas
                    </h3>
                    <div className="space-y-4">
                      {habitaciones.map((hab) => (
                        <HabitacionCard
                          key={hab.id}
                          habitacion={hab}
                          porcentaje={coeficiente}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Paquetes */}
                {paquetes.length > 0 && (
                  <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                      <Package className="w-5 h-5" />
                      Paquetes Seleccionados
                    </h3>
                    <div className="space-y-4">
                      {paquetes.map((pack) => (
                        <PaqueteCard
                          key={pack.id}
                          paquete={pack}
                          porcentaje={coeficiente}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Resumen por hotel (usa tu componente Resumen) */}
                <Resumen
                  habitaciones={habitaciones}
                  paquetes={paquetes}
                  porcentaje={coeficiente}
                  isHighSeason={temporada === 'alta'}
                />
              </div>
            );
          })}
        </div>

        {/* columna derecha: ResumenPago (sticky). Sólo le pasamos los totales necesarios */}
        <ResumenPago />
      </div>
    </div>
  );
}

export default PagoPage;
