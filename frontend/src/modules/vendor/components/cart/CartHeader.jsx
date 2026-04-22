import { ShoppingCart } from 'lucide-react';

// Encabezado del carrito con título e icono
function CartHeader() {
  return (
    <h2
      id="cart-summary-title"
      className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100"
    >
      <ShoppingCart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      Carrito de Reservas
    </h2>
  );
}

export default CartHeader;
