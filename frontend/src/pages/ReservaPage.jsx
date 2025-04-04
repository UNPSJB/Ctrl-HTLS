import { Bed, Package, Users } from 'lucide-react';

const ReservaPage = () => {
  const reserva = [
    {
      habitaciones: [
        { id: 1, nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
        { id: 2, nombre: 'Suite Ejecutiva', capacidad: 3, precio: 300 },
      ],
      paquetes: [
        {
          id: 10,
          nombre: 'Escapada Romántica',
          habitaciones: [
            { id: 3, nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
            { id: 4, nombre: 'Habitación Estándar', capacidad: 2, precio: 150 },
          ],
          descuento: 10, // %
          noches: 3,
        },
      ],
    },
  ];

  const hotelReserva = reserva[0]; // Tomamos la primera reserva

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Detalles de la Reserva
            </h1>

            {/* Habitaciones Seleccionadas */}
            {hotelReserva.habitaciones.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Bed className="w-5 h-5" />
                  Habitaciones Seleccionadas
                </h2>
                <div className="space-y-4">
                  {hotelReserva.habitaciones.map((habitacion) => (
                    <div
                      key={habitacion.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-gray-100">
                            {habitacion.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Capacidad: {habitacion.capacidad} personas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                            $0/noche
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paquetes Seleccionados */}
            {hotelReserva.paquetes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Package className="w-5 h-5" />
                  Paquetes Seleccionados
                </h2>
                <div className="space-y-4">
                  {hotelReserva.paquetes.map((paquete) => (
                    <div
                      key={paquete.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100">
                          {paquete.nombre}
                        </h3>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                          $0
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Noches: {paquete.noches}
                      </p>
                      <div className="mt-3">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">
                          Habitaciones Incluidas:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
                          {paquete.habitaciones.map((hab) => (
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
                  ))}
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
                  $0
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal Paquetes:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  $0
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
                <span>Total:</span>
                <span>$0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReservaPage;
