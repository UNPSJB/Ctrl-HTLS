import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import CartSummary from '@cart/CartSummary';
import ReservaPendienteView from '@cart/ReservaPendienteView';
import { useDisponibilidadSearch } from '@vendor-hooks/useDisponibilidadSearch';
import { useCarrito } from '@vendor-context/CarritoContext';

const HomePage = () => {
  const { hoteles, isLoading, error, buscarDisponibilidad } =
    useDisponibilidadSearch();
  const { reservaConfirmada } = useCarrito();

  const estaBloqueado = !!reservaConfirmada;

  return (
    <div className="flex flex-col gap-6">
      <HotelSearch
        onSearch={buscarDisponibilidad}
        isLoading={isLoading}
        isDisabled={estaBloqueado}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {estaBloqueado ? (
            <ReservaPendienteView />
          ) : (
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
  );
};

export default HomePage;
