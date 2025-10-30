import { useCallback, useMemo } from 'react';
import { Trash2, Package as PackageIcon } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { calcPackageTotal } from '@utils/pricingUtils';
import { useCarrito } from '@context/CarritoContext';
import DateDisplay from '@ui/DateDisplay';

function PackageCartItem({ pack, hotel, onRemove = null }) {
  const { fechaInicio, fechaFin, nombre, _cartId } = pack || {};

  const { final: finalTotal } = useMemo(() => {
    return calcPackageTotal({
      paquete: pack,
      porcentaje: hotel?.temporada?.porcentaje,
    });
  }, [pack, hotel]);

  const { removerPaquete } = useCarrito();

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(_cartId);
      return;
    }
    if (typeof removerPaquete === 'function') {
      removerPaquete(hotel?.hotelId, _cartId);
    }
  }, [onRemove, removerPaquete, hotel?.hotelId, _cartId]);

  if (!pack) return null;

  return (
    <div className="mb-3 flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="flex items-center gap-2 truncate font-semibold text-gray-900 dark:text-gray-100">
              <PackageIcon className="h-5 w-5 flex-shrink-0 text-current" />
              <span className="truncate">{nombre ?? 'Paquete'}</span>
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
            disabled={!_cartId}
            className="group rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PackageCartItem;
