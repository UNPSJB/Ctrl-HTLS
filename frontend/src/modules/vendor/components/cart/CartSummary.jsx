import { useCarrito } from '@vendor-context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';
import { Lock } from 'lucide-react';

const LockedCartFooter = () => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
    <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
      Carrito bloqueado temporalmente por reserva en curso
    </span>
  </div>
);

// Componente principal que agrupa el encabezado, listado de hoteles y footer del carrito
function CartSummary() {
  const { carrito, totalElementos, reservaConfirmada } = useCarrito();
  const isEmpty = totalElementos === 0;

  return (
    <aside
      className="sticky top-28 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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
          <LockedCartFooter />
        ) : (
          <CartFooter hotels={carrito?.hoteles ?? []} />
        )}
      </div>
    </aside>
  );
}

export default CartSummary;
