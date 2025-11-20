import { useCarrito } from '@context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';
import { useNavigate } from 'react-router-dom';
import { Clock, Ban, CreditCard } from 'lucide-react';

const LockedCartFooter = ({ onCancel }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 rounded-lg border-t border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
          Reserva Pendiente de Pago
        </h4>
      </div>
      <p className="text-xs text-yellow-700 dark:text-yellow-300">
        Esta reserva está bloqueada. Debes continuar al pago o cancelarla.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Ban className="h-4 w-4" />
          Cancelar
        </button>
        <button
          onClick={() => navigate('/pago')}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <CreditCard className="h-4 w-4" />
          Ir al Pago
        </button>
      </div>
    </div>
  );
};

function CartSummary() {
  const { carrito, totalElementos, reservaConfirmada, cancelarReserva } =
    useCarrito();
  const isEmpty = totalElementos === 0;

  return (
    <aside
      className="sticky top-28 overflow-hidden rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800"
      aria-labelledby="cart-summary-title"
      role="complementary"
    >
      <CartHeader />

      <div className="mt-4 max-h-[65vh] space-y-4 overflow-auto">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          (carrito.hoteles || []).map((hotel) => (
            <HotelCartSection
              key={hotel.hotelId ?? hotel.nombre}
              hotel={hotel}
              isLocked={!!reservaConfirmada}
            />
          ))
        )}
      </div>

      <div className="mt-4">
        {reservaConfirmada ? (
          <LockedCartFooter onCancel={cancelarReserva} />
        ) : (
          <CartFooter hotels={carrito?.hoteles ?? []} />
        )}
      </div>
    </aside>
  );
}

export default CartSummary;
