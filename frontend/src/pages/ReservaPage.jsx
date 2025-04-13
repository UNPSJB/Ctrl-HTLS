import { Bed, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import Cliente from '@components/Cliente';
import hotelesData from '@/data/hotels.json';

const ReservaPage = () => {
  const { carrito } = useCarrito();

  // Para este ejemplo usaremos el primer hotel del carrito
  const hotelReserva = carrito.hoteles[0];

  // Validación si no hay reservas en el carrito
  if (!hotelReserva) {
    return (
      <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
      </div>
    );
  }

  // Si el hotel en el carrito no tiene datos completos en la propiedad "datos",
  // se buscan en el JSON de hoteles
  const datosHotel =
    hotelReserva.datos && Object.keys(hotelReserva.datos).length > 0
      ? hotelReserva.datos
      : hotelesData.find((h) => h.id === hotelReserva.idHotel);

  // Extraer las ids de las habitaciones y paquetes seleccionados
  const { habitaciones = [], paquetes = [] } = hotelReserva;

  // Obtener la información completa de las habitaciones y paquetes seleccionados
  const habitacionesSeleccionadas = datosHotel.habitaciones.filter((hab) =>
    habitaciones.includes(hab.id)
  );
  const paquetesSeleccionados = datosHotel.paquetes.filter((pack) =>
    paquetes.includes(pack.id)
  );

  // Calcular el subtotal de las habitaciones
  const subtotalHabitaciones = habitacionesSeleccionadas.reduce(
    (acc, hab) => acc + (hab.precio || 0),
    0
  );

  // Calcular el subtotal de los paquetes
  const subtotalPaquetes = paquetesSeleccionados.reduce((acc, pack) => {
    const precioHabitaciones = pack.habitaciones.reduce(
      (suma, hab) => suma + hab.precio,
      0
    );
    const totalConDescuento =
      precioHabitaciones * pack.noches * (1 - pack.descuento / 100);
    return acc + totalConDescuento;
  }, 0);

  // Total general
  const total = subtotalHabitaciones + subtotalPaquetes;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Detalles de la Reserva
        </h1>

        {/* Sección de Habitaciones Seleccionadas */}
        {habitacionesSeleccionadas.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Bed className="w-5 h-5" />
              Habitaciones Seleccionadas
            </h2>
            <div className="space-y-4">
              {habitacionesSeleccionadas.map((hab) => (
                <HabitacionCard key={hab.id} habitacion={hab} />
              ))}
            </div>
          </section>
        )}

        {/* Sección de Paquetes Seleccionados */}
        {paquetesSeleccionados.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Package className="w-5 h-5" />
              Paquetes Seleccionados
            </h2>
            <div className="space-y-4">
              {paquetesSeleccionados.map((pack) => (
                <PaqueteCard key={pack.id} paquete={pack} />
              ))}
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
