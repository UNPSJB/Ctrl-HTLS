import { useNavigate } from 'react-router-dom';
import { calcularTotalCarrito } from '@utils/pricingUtils';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();

  // calcula totales usando util central (si no existe, fallback cero)
  const totals =
    typeof calcularTotalCarrito === 'function'
      ? calcularTotalCarrito(hotels ?? [])
      : { final: 0, original: 0, descuento: 0 };

  const handleClick = () => {
    if (!hotels || hotels.length === 0) return;
    onClose?.();
    navigate('/reserva');
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ${Number(totals.final ?? 0).toFixed(2)}
          </div>
        </div>
        <button
          onClick={handleClick}
          disabled={!hotels || hotels.length === 0}
          className={`px-4 py-2 rounded-md font-medium text-white ${
            hotels && hotels.length > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          aria-disabled={!hotels || hotels.length === 0}
          title="Reservar / Pagar"
        >
          Reservar / Pagar
        </button>
      </div>
    </div>
  );
}

export default CartFooter;
