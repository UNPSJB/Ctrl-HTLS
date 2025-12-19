import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import CartSummary from '@cart/CartSummary';
import { useDisponibilidadSearch } from '@/hooks/useDisponibilidadSearch';
import { useCarrito } from '@context/CarritoContext';

const HomePage = () => {
  const { hoteles, isLoading, error, buscarDisponibilidad } =
    useDisponibilidadSearch();
  const { reservaConfirmada } = useCarrito();

  const estaBloqueado = !!reservaConfirmada;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
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
