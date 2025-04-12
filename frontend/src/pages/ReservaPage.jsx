import { Bed, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import Cliente from '@components/Cliente';

const ReservaPage = () => {
  const { carrito } = useCarrito();

  // Para este ejemplo usaremos el primer hotel del carrito
  const hotelReserva = carrito.hoteles[0];

  // Validación si no hay datos aún
  if (!hotelReserva) {
    return (
      <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
      </div>
    );
  }

  // Se extraen habitaciones, paquetes y datos adicionales del hotel seleccionado
  const { habitaciones = [], paquetes = [], datos = {} } = hotelReserva;

  // Calcular el subtotal de habitaciones
  const subtotalHabitaciones = habitaciones.reduce((acc, id) => {
    const hab = datos.habitaciones?.find((h) => h.id === id);
    return acc + (hab?.precio || 0);
  }, 0);

  // Calcular el subtotal de paquetes
  const subtotalPaquetes = paquetes.reduce((acc, id) => {
    const pack = datos.paquetes?.find((p) => p.id === id);
    if (!pack) return acc;
    const precioHabitaciones = pack.habitaciones.reduce(
      (suma, h) => suma + h.precio,
      0
    );
    const totalConDescuento =
      precioHabitaciones * pack.noches * (1 - pack.descuento / 100);
    return acc + totalConDescuento;
  }, 0);

  // Calcular el total general
  const total = subtotalHabitaciones + subtotalPaquetes;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Detalles de la Reserva
        </h1>

        {/* Sección de Habitaciones Seleccionadas */}
        {habitaciones.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Bed className="w-5 h-5" />
              Habitaciones Seleccionadas
            </h2>
            <div className="space-y-4">
              {habitaciones.map((id) => {
                const hab = datos.habitaciones?.find((h) => h.id === id);
                return hab ? (
                  <HabitacionCard key={id} habitacion={hab} />
                ) : null;
              })}
            </div>
          </section>
        )}

        {/* Sección de Paquetes Seleccionados */}
        {paquetes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Package className="w-5 h-5" />
              Paquetes Seleccionados
            </h2>
            <div className="space-y-4">
              {paquetes.map((id) => {
                const pack = datos.paquetes?.find((p) => p.id === id);
                return pack ? <PaqueteCard key={id} paquete={pack} /> : null;
              })}
            </div>
          </section>
        )}

        {/* Sección de Resumen */}
        <Resumen
          subtotalHabitaciones={subtotalHabitaciones}
          subtotalPaquetes={subtotalPaquetes}
          total={total}
        />
      </div>

      {/* Información del Cliente */}
      <div className="mt-6">
        <Cliente />
      </div>
    </div>
  );
};

export default ReservaPage;
