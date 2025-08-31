import { ShoppingCart } from 'lucide-react';

function CartEmpty() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 text-center py-6 "
    >
      <ShoppingCart
        size={72}
        className="text-gray-400 dark:text-gray-300"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <div className="max-w-[14rem] md:max-w-xs text-sm text-gray-600 dark:text-gray-300">
        <p className="font-medium text-base">Tu carrito está vacío</p>
        <p className="text-xs mt-1">
          Agrega habitaciones o paquetes para ver un resumen.
        </p>
      </div>
    </div>
  );
}

export default CartEmpty;
