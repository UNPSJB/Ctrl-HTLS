import { Bed, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import Cliente from '@components/Cliente';
import { useCliente } from '@context/ClienteContext';
import { useNavigate } from 'react-router-dom';
import Temporada from '@components/Temporada';

const ReservaPage = () => {
  const { carrito } = useCarrito();
  const { client } = useCliente();
  const navigate = useNavigate();

  if (!carrito.hoteles.length) {
    return (
      <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
      </div>
    );
  }

  const handleGoToPago = () => {
    if (!client) {
      alert('Seleccioná un cliente antes de continuar al pago.');
      return;
    }
    navigate('/pago');
  };

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

        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {nombre ?? 'Hotel'}
              </h1>
              {/* Muestra temporada si es alta (usamos el componente Temporada que tenías) */}
              {temporada === 'alta' && <Temporada porcentaje={coeficiente} />}
            </div>

            {habitaciones.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Bed className="w-5 h-5" />
                  Habitaciones Seleccionadas
                </h2>
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

            {paquetes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Package className="w-5 h-5" />
                  Paquetes Seleccionados
                </h2>
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

            <Resumen
              habitaciones={habitaciones}
              paquetes={paquetes}
              porcentaje={coeficiente}
              isHighSeason={temporada === 'alta'}
            />
          </div>
        );
      })}

      <div className="mt-6">
        <Cliente />
      </div>

      {/* Botón general para ir a Pagar */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={handleGoToPago}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Pagar
        </button>
      </div>
    </div>
  );
};

export default ReservaPage;
