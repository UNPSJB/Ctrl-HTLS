import { Bed, Package, Users } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import Cliente from '@/components/Cliente';

const ReservaPage = () => {
  const { carrito } = useCarrito();

  // Para este ejemplo usaremos el primer hotel del carrito
  const hotelReserva = carrito.hoteles[0];

  // Validación si no hay datos aún
  if (!hotelReserva) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
      </div>
    );
  }

  // Acá necesitarás tener los datos completos (nombre, capacidad, precio) de habitaciones y paquetes, no solo los IDs.
  // Para ahora, simularemos que esos datos vienen precargados en el campo `datos`.

  const { habitaciones = [], paquetes = [], datos = {} } = hotelReserva;

  // Totalización simple para ejemplo (ideal que lo hagas con useMemo si se complica más)
  const subtotalHabitaciones = habitaciones.reduce((acc, id) => {
    const hab = datos.habitaciones?.find((h) => h.id === id);
    return acc + (hab?.precio || 0);
  }, 0);

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

  const total = subtotalHabitaciones + subtotalPaquetes;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Detalles de la Reserva
            </h1>

            {/* Habitaciones Seleccionadas */}
            {habitaciones.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Bed className="w-5 h-5" />
                  Habitaciones Seleccionadas
                </h2>
                <div className="space-y-4">
                  {habitaciones.map((id) => {
                    const hab = datos.habitaciones?.find((h) => h.id === id);
                    if (!hab) return null;
                    return (
                      <div
                        key={id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-100">
                              {hab.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Capacidad: {hab.capacidad} personas
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                              ${hab.precio}/noche
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paquetes Seleccionados */}
            {paquetes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Package className="w-5 h-5" />
                  Paquetes Seleccionados
                </h2>
                <div className="space-y-4">
                  {paquetes.map((id) => {
                    const pack = datos.paquetes?.find((p) => p.id === id);
                    if (!pack) return null;
                    const precioHabitaciones = pack.habitaciones.reduce(
                      (suma, h) => suma + h.precio,
                      0
                    );
                    const totalConDescuento =
                      precioHabitaciones *
                      pack.noches *
                      (1 - pack.descuento / 100);

                    return (
                      <div
                        key={id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800 dark:text-gray-100">
                            {pack.nombre}
                          </h3>
                          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                            ${totalConDescuento.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Noches: {pack.noches} | Descuento: {pack.descuento}%
                        </p>
                        <div className="mt-3">
                          <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">
                            Habitaciones Incluidas:
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
                            {pack.habitaciones.map((hab) => (
                              <li
                                key={hab.id}
                                className="flex items-center gap-1"
                              >
                                • {hab.nombre} ({hab.capacidad} personas)
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resumen */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal Habitaciones:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  ${subtotalHabitaciones.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal Paquetes:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  ${subtotalPaquetes.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Información del Cliente */}
      <div className="mt-6">
        <Cliente />
      </div>
    </div>
  );
};

export default ReservaPage;
