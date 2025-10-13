// Icono de carrito importado desde lucide-react
import { ShoppingCart } from 'lucide-react';

function CartHeader() {
  return (
    <div className="py-4">
      <h2
        id="cart-title"
        className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        <ShoppingCart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        Carrito de Reservas
      </h2>
    </div>
  );
}

export default CartHeader;
