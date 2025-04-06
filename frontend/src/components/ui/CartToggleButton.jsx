// src/components/ui/CartToggleButton.jsx
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const CartToggleButton = ({ onClick }) => {
  const { totalItems } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative group p-2 flex items-center justify-center"
      aria-label="Abrir carrito"
    >
      <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-green-500" />

      {/* Badge contador */}
      {totalItems > 0 && (
        <span
          className="absolute -top-0 -right-1 flex items-center justify-center 
        w-5 h-5 rounded-full text-xs font-bold 
        bg-gray-600 text-white dark:bg-gray-200 dark:text-gray-900"
        >
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartToggleButton;
