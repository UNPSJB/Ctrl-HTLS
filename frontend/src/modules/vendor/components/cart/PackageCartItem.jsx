import { useCallback, useMemo } from 'react';
import { Trash2, Package as PackageIcon } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { calcPackageTotal } from '@utils/pricingUtils';
import { useCarrito } from '@vendor-context/CarritoContext';
import DateDisplay from '@ui/DateDisplay';
import { capitalizeWords } from '@/utils/stringUtils';

// Elemento individual de un paquete dentro de la sección de hotel del carrito
function PackageCartItem({ pack, hotel, onRemove = null, isLocked = false }) {
  const { fechaInicio, fechaFin, nombre, _cartId } = pack || {};

  const { original: originalTotal, final: finalTotal } = useMemo(() => {
    return calcPackageTotal({
      paquete: pack,
    });
  }, [pack]);

  const { removerPaquete } = useCarrito();

  const handleRemove = useCallback(() => {
    if (isLocked) return;
    if (onRemove) {
      onRemove(_cartId);
      return;
    }
    if (typeof removerPaquete === 'function') {
      removerPaquete(hotel?.hotelId, _cartId);
    }
  }, [onRemove, removerPaquete, hotel?.hotelId, _cartId, isLocked]);

  if (!pack) return null;

  return (
    <div className="mb-3 flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="flex items-center gap-2 truncate font-semibold text-gray-900 dark:text-gray-100">
              <PackageIcon className="h-5 w-5 flex-shrink-0 text-current" />
              <span className="truncate">{capitalizeWords(nombre ?? 'Paquete')}</span>
            </h4>
          </div>
          <PriceTag precio={finalTotal} />
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
          <DateDisplay fechaInicio={fechaInicio} fechaFin={fechaFin} />
          <button
            onClick={handleRemove}
            aria-label={`Eliminar paquete ${nombre ?? ''}`}
            title="Eliminar paquete"
            disabled={!_cartId || isLocked}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500 focus:outline-none focus:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-500 dark:hover:text-red-400 dark:focus:text-red-400"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PackageCartItem;
