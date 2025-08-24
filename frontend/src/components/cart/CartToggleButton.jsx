// src/components/cart/CartToggleButton.jsx
import { ShoppingCart } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';

/**
 * CartToggleButton
 * - Mantiene el estilo original del proyecto.
 * - Añade soporte para `disabled` (no ejecuta onClick y cambia apariencia).
 *
 * Props:
 *  - onClick: función (se llamará solo si !disabled)
 *  - disabled: boolean (opcional) -> si true el botón no responde
 */
function CartToggleButton({ onClick, disabled = false }) {
  const { totalElementos } = useCarrito();

  const handleClick = (e) => {
    if (disabled || totalElementos === 0) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative group p-2 flex items-center justify-center rounded-md transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
      `}
      aria-label={disabled ? 'No hay reservas' : 'Abrir carrito'}
      aria-disabled={disabled || totalElementos === 0}
      title={disabled ? 'No hay reservas' : 'Abrir carrito'}
    >
      {/* Icono: mantiene los estilos originales, usa text-current solo si quieres heredar color */}
      <ShoppingCart
        className={`w-6 h-6 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-green-500'}`}
      />

      {/* Badge de cantidad, mantiene tus estilos originales */}
      {totalElementos > 0 && (
        <span
          className="absolute -top-0 -right-1 flex items-center justify-center 
            w-5 h-5 rounded-full text-xs font-bold 
            bg-gray-600 text-white dark:bg-gray-200 dark:text-gray-900"
        >
          {totalElementos}
        </span>
      )}
    </button>
  );
}

export default CartToggleButton;
