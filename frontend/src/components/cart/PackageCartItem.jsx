import { Trash2 } from 'lucide-react';
import { Package as PackageIcon } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import { calcularPrecioFinalPaquete } from '@utils/pricingUtils';

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
    <div className="mb-3 flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      <div className="flex-1">
        <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          <PackageIcon className="h-5 w-5 text-current" />
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
        className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
        title="Eliminar paquete"
      >
        <Trash2 className="h-5 w-5 text-current" />
      </button>
    </div>
  );
}

export default PackageCartItem;
