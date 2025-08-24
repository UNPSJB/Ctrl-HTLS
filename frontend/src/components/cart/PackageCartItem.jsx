// src/components/cart/PackageCartItem.jsx
import { Trash2 } from 'lucide-react';
import { Package as PackageIcon } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import {
  calcularPrecioFinalPaquete,
  // calcPackageFinal
} from '@utils/pricingUtils';

// Item presentacional de paquete (visual-only)
function PackageCartItem({ pack = {}, hotel = {}, onRemove: onRemoveProp }) {
  const { removerPaquete } = useCarrito();
  const onRemove =
    onRemoveProp || (() => removerPaquete(hotel.idHotel, pack.id));

  const computed =
    typeof calcularPrecioFinalPaquete === 'function'
      ? calcularPrecioFinalPaquete({
          paquete: pack,
          descuentoHotel: hotel.coeficiente ?? 0,
        })
      : { final: 0 };

  return (
    <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
      <div className="flex-1">
        <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          <PackageIcon className="w-5 h-5 text-current" />
          <span>{pack.nombre}</span>
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Precio:{' '}
          <span className="font-medium">
            ${Number(computed.final ?? 0).toFixed(2)}
          </span>
        </p>
      </div>

      <button
        onClick={onRemove}
        aria-label={`Eliminar paquete ${pack.nombre}`}
        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        title="Eliminar paquete"
      >
        <Trash2 className="w-5 h-5 text-current" />
      </button>
    </div>
  );
}

export default PackageCartItem;
