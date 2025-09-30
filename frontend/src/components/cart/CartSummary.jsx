import { useCarrito } from '@context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';

function CartSummary() {
  // Obtenemos el estado y el totalElementos para determinar si está vacío.
  const { carrito, totalElementos } = useCarrito();

  const isEmpty = Number(totalElementos ?? 0) === 0;

  return (
    <aside
      className="shadow-card sticky top-28 rounded-lg bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      aria-labelledby="cart-summary-title"
      role="complementary"
    >
      <CartHeader />

      <div className="mt-4 max-h-[65vh] space-y-4 overflow-auto">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          // Mapeamos los hoteles del carrito
          (carrito?.hoteles || []).map((hotel) => (
            <HotelCartSection
              key={hotel.hotelId ?? hotel.nombre}
              hotel={hotel}
            />
          ))
        )}
      </div>

      <div className="mt-4">
        <CartFooter hotels={carrito?.hoteles ?? []} />
      </div>
    </aside>
  );
}

export default CartSummary;
