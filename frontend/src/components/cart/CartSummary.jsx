import { useCarrito } from '@context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';

function CartSummary() {
  const { carrito, totalElementos } = useCarrito();
  const isEmpty = totalElementos === 0;

  return (
    <aside
      // Estilos principales: Sombra, fondo y padding general. Sin borde ni altura fija.
      className="sticky top-28 overflow-hidden rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800"
      aria-labelledby="cart-summary-title"
      role="complementary"
    >
      <CartHeader />

      {/* Contenedor del contenido con altura máxima y scroll */}
      <div className="mt-4 max-h-[65vh] space-y-4 overflow-auto">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          (carrito.hoteles || []).map((hotel) => (
            <HotelCartSection
              key={hotel.hotelId ?? hotel.nombre}
              hotel={hotel}
            />
          ))
        )}
      </div>

      {/* Pie de página */}
      <div className="mt-4">
        <CartFooter hotels={carrito?.hoteles ?? []} />
      </div>
    </aside>
  );
}

export default CartSummary;
