// src/components/cart/CartHeader.jsx
import { X } from 'lucide-react';

// Encabezado del drawer: título + botón cerrar
function CartHeader({ title = 'Carrito de Reservas', onClose }) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h2
        id="cart-title"
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        {title}
      </h2>

      <button
        onClick={onClose}
        aria-label="Cerrar carrito"
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        autoFocus
      >
        <X className="w-5 h-5 text-current" />
      </button>
    </div>
  );
}

export default CartHeader;
