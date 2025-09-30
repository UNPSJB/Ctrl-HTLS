import { useCallback, useMemo } from 'react';
import { Trash2, Package as PackageIcon, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import pricingUtils from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';
import { useCarrito } from '@context/CarritoContext';
const { calcPackageTotal } = pricingUtils;
const { formatFecha, nightsBetween } = dateUtils;

function PackageCartItem({ pack, hotel, onRemove = null }) {
  const {
    fechaInicio,
    fechaFin,
    qty = 1,
    nombre,
    id,
    noches,
    capacidad = 2,
  } = pack || {};

  // Calculamos las noches (usa 'noches' si está definido, sino calcula entre fechas)
  const nights =
    Number(noches) || nightsBetween(fechaInicio, fechaFin, { useUTC: true });

  const { original: originalTotal, final: finalTotal } = useMemo(() => {
    // Tomamos el porcentaje de descuento de temporada del hotel (o 0 si no existe)
    const hotelSeasonDiscount = hotel?.temporada?.porcentaje ?? 0;

    return calcPackageTotal({
      paquete: pack,
      qty,
      hotelSeasonDiscount,
    });
  }, [pack, hotel, qty]);

  // Acciones del contexto
  const { removerPaquete } = useCarrito();

  const handleRemove = useCallback(() => {
    if (onRemove) {
      // Si se pasa una función onRemove, la usa. (Se asume que onRemove usa pack.id)
      onRemove(id);
    } else if (hotel?.hotelId && id) {
      // Si no, usa la acción del contexto
      removerPaquete(hotel.hotelId, id);
    }
  }, [onRemove, hotel?.hotelId, id, removerPaquete]);

  if (!pack) return null;

  return (
    // Contenedor principal con fondo redondeado y sombra ligera
    <div className="mb-3 flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      {/* Columna 1: Datos paquete (flex-1 para ocupar espacio) */}
      <div className="min-w-0 flex-1">
        {/* Nombre del Paquete */}
        <h4 className="flex items-center gap-2 truncate font-medium text-gray-900 dark:text-gray-100">
          <PackageIcon className="h-5 w-5 text-current" />
          <span className="truncate">
            {nombre ?? pack.name ?? 'Paquete de Viaje'}
          </span>
        </h4>

        <div className="mt-1 flex flex-col text-sm text-gray-600 dark:text-gray-300 sm:flex-row sm:items-center sm:gap-4">
          {/* Capacidad (Para paridad estructural) */}
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {capacidad ?? pack.capacity ?? '-'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({qty} unidad{qty > 1 ? 'es' : ''})
            </span>
          </p>

          {/* Fechas y Noches */}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 sm:mt-0">
            {formatFecha(fechaInicio)} — {formatFecha(fechaFin)} ({nights} noche
            {nights > 1 ? 's' : ''})
          </p>
        </div>
      </div>

      {/* Columna 2: Precio */}
      <div className="text-right">
        <PriceTag
          precio={finalTotal}
          original={finalTotal < originalTotal ? originalTotal : undefined}
          seasonLayout="column"
        />
      </div>

      {/* Columna 3: Botón eliminar */}
      <div className="flex items-center">
        <button
          onClick={handleRemove}
          aria-label={`Eliminar paquete ${nombre ?? pack.name ?? ''}`}
          title="Eliminar paquete"
          disabled={!pack?.id}
          className={`flex h-8 w-8 transform items-center justify-center rounded-full text-red-600 transition duration-150 ease-in-out hover:scale-105 hover:bg-red-50 hover:text-red-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/10 dark:hover:text-red-300 dark:focus-visible:ring-red-700`}
        >
          <Trash2 className="h-5 w-5 text-current" />
        </button>
      </div>
    </div>
  );
}

export default PackageCartItem;
