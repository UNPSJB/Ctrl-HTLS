import { Bed, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import Cliente from '@components/Cliente';
import { calculateReservationTotal } from '@utils/pricingUtils';
import Temporada from '@components/Temporada';

const ReservaPage = () => {
  const { carrito } = useCarrito();

  if (!carrito.hoteles.length) {
    return (
      <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {carrito.hoteles.map((hotelReserva, idx) => {
        const {
          nombre,
          temporada,
          coeficiente,
          habitaciones = [],
          paquetes = [],
        } = hotelReserva;

        let totalOriginal = 0,
          totalFinal = 0,
          totalDiscount = 0;
        if (habitaciones.length > 0 || paquetes.length > 0) {
          const {
            totalOriginal: tO,
            totalFinal: tF,
            totalDiscount: tD,
          } = calculateReservationTotal(
            habitaciones,
            paquetes,
            temporada === 'alta',
            coeficiente
          );
          totalOriginal = tO;
          totalFinal = tF;
          totalDiscount = tD;
        }

        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {nombre ?? 'Hotel'}
              </h1>
              {/* Muestra temporada si es alta */}
              {temporada === 'alta' && <Temporada porcentaje={coeficiente} />}
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-200">
                <b>Temporada:</b>{' '}
                {temporada ?? (
                  <span className="italic text-red-500">No disponible</span>
                )}
              </p>
              <p className="text-gray-700 dark:text-gray-200">
                <b>Coeficiente:</b>{' '}
                {typeof coeficiente === 'number' ? (
                  coeficiente
                ) : (
                  <span className="italic text-red-500">No disponible</span>
                )}
              </p>
            </div>

            {habitaciones.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Bed className="w-5 h-5" />
                  Habitaciones Seleccionadas
                </h2>
                <div className="space-y-4">
                  {habitaciones.map((hab) => (
                    <HabitacionCard key={hab.id} habitacion={hab} />
                  ))}
                </div>
              </section>
            )}

            {paquetes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Package className="w-5 h-5" />
                  Paquetes Seleccionados
                </h2>
                <div className="space-y-4">
                  {paquetes.map((pack) => (
                    <PaqueteCard key={pack.id} paquete={pack} />
                  ))}
                </div>
              </section>
            )}

            {(habitaciones.length > 0 || paquetes.length > 0) && (
              <Resumen
                totalOriginal={totalOriginal}
                totalFinal={totalFinal}
                totalDiscount={totalDiscount}
              />
            )}
          </div>
        );
      })}

      <div className="mt-6">
        <Cliente />
      </div>
    </div>
  );
};

export default ReservaPage;
