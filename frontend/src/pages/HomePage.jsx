import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import CartSummary from '@cart/CartSummary';
import { useDisponibilidadSearch } from '@/hooks/useDisponibilidadSearch';
import { useCarrito } from '@context/CarritoContext';
import { Clock } from 'lucide-react';

const ReservaBloqueadaBanner = () => {
  return (
    <div className="mb-8 flex items-center gap-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
      <Clock className="h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
      <div>
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
          Reserva Pendiente
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Tienes una reserva pendiente de pago. Para realizar una nueva
          búsqueda, primero debes cancelar la reserva actual desde el carrito.
        </p>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { hoteles, isLoading, error, buscarDisponibilidad } =
    useDisponibilidadSearch();
  const { reservaConfirmada } = useCarrito();

  const estaBloqueado = !!reservaConfirmada;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {estaBloqueado && <ReservaBloqueadaBanner />}
        <HotelSearch
          onSearch={buscarDisponibilidad}
          isLoading={isLoading}
          isDisabled={estaBloqueado}
        />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {!estaBloqueado && (
              <HotelList
                hoteles={hoteles}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
