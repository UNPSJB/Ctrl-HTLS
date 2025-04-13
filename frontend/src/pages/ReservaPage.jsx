import { Bed, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import HabitacionCard from '@ui/cards/HabitacionCard';
import PaqueteCard from '@ui/cards/PaqueteCard';
import Resumen from '@ui/Resumen';
import Cliente from '@components/Cliente';
import hotelesData from '@/data/hotels.json';
import { calculateReservationTotal } from '@utils/pricingUtils';

const ReservaPage = () => {
  const { carrito } = useCarrito();

  // Para este ejemplo usamos el primer hotel del carrito
  const hotelReserva = carrito.hoteles[0];

  // Si no hay reservas en el carrito, se muestra un mensaje
  if (!hotelReserva) {
    return (
      <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
      </div>
    );
  }

  // Si el objeto del hotel no tiene datos completos en "datos",
  // se buscan los datos completos en el JSON de hoteles.
  const datosHotel =
    hotelReserva.datos && Object.keys(hotelReserva.datos).length > 0
      ? hotelReserva.datos
      : hotelesData.find((h) => h.id === hotelReserva.idHotel);

  // Extraemos las ids de las habitaciones y paquetes seleccionados
  const { habitaciones = [], paquetes = [] } = hotelReserva;

  // Obtenemos los arrays completos de habitaciones y paquetes a partir de los IDs
  const habitacionesSeleccionadas = datosHotel.habitaciones.filter((hab) =>
    habitaciones.includes(hab.id)
  );
  const paquetesSeleccionados = datosHotel.paquetes.filter((pack) =>
    paquetes.includes(pack.id)
  );

  // Determinamos si es temporada alta y obtenemos el coeficiente de descuento
  const isHighSeason = hotelReserva.temporada === 'alta';
  const discountCoefficient = hotelReserva.coeficiente; // Ej: 0.1 para 10%

  // Calculamos los totales usando el util
  const { totalOriginal, totalFinal, totalDiscount } =
    calculateReservationTotal(
      habitacionesSeleccionadas,
      paquetesSeleccionados,
      isHighSeason,
      discountCoefficient
    );

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

        {/* Sección de Resumen de Precios */}
        <Resumen
          totalOriginal={totalOriginal}
          totalFinal={totalFinal}
          totalDiscount={totalDiscount}
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
