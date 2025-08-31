// src/components/cart/CartSummary.jsx
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';

/*
  CartSummary como columna/summary. Comentarios en español; nombres en inglés.
*/
function CartSummary() {
  const { carrito, totalElementos } = useCarrito();
  const navigate = useNavigate();

  const isEmpty = Number(totalElementos ?? 0) === 0;

  const handleNavigateToReservation = useCallback(() => {
    navigate('/reserva');
  }, [navigate]);

  return (
    <aside
      className="sticky top-6 shadow-card p-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      aria-labelledby="cart-summary-title"
      role="complementary"
    >
      <CartHeader />

      <div className="mt-4 space-y-4 overflow-auto max-h-[65vh]">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          (carrito?.hoteles || []).map((hotel) => (
            <HotelCartSection
              key={hotel.idHotel ?? hotel.nombre}
              hotel={hotel}
            />
          ))
        )}
      </div>

      <div className="mt-4">
        <CartFooter
          hotels={carrito?.hoteles ?? []}
          onClose={handleNavigateToReservation}
        />
      </div>
    </aside>
  );
}

export default CartSummary;
