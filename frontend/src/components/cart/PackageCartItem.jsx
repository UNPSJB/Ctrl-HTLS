import { useCallback, useMemo } from 'react';
import { Trash2, House, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import pricingUtils from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';
import { useCarrito } from '@context/CarritoContext';

const { calcPackageTotal } = pricingUtils;
const { formatFecha, nightsBetween } = dateUtils;

// Se usa el alias 'pack' para el prop 'room' para mantener el JSX original intacto
function PackageCartItem({ pack: room, hotel, onRemove = null }) {
  const {
    fechaInicio,
    fechaFin,
    qty = 1,
    nombre,
    capacidad,
    id, // Usamos 'id' para la remoción
    noches = 1, // La duración del paquete
  } = room || {};

  // Las noches del paquete. Si no está definido, se calcula entre fechas.
  const nights =
    Number(noches) || nightsBetween(fechaInicio, fechaFin, { useUTC: true });

  // Cálculo de totales con la utilidad centralizada (memoizado)
  const { original: originalTotal, final: finalTotal } = useMemo(() => {
    const hotelSeasonDiscount = hotel?.temporada?.porcentaje ?? 0;

    // calcPackageTotal espera el objeto 'paquete' (room es el alias de pack)
    return calcPackageTotal({
      paquete: room,
      qty,
      hotelSeasonDiscount,
    });
  }, [room, hotel, qty, nights]);

  // Acciones del contexto
  const { removerPaquete } = useCarrito(); // CAMBIO: Usamos removerPaquete

  // Maneja la eliminación
  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(id);
    } else if (hotel?.hotelId && id) {
      // Eliminar del carrito global
      removerPaquete(hotel.hotelId, id); // CAMBIO: Llama a removerPaquete
    }
  }, [onRemove, hotel?.hotelId, id, removerPaquete]);

  return (
    <div className="flex items-start gap-4 border-b border-gray-100 py-4 dark:border-gray-700">
      {/* Columna 1: Info */}
      <div className="flex flex-grow items-start gap-3">
        {/* Ícono House */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          <House size={20} aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {nombre ?? room.name ?? 'Paquete'}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {/* Capacidad (Etiqueta heredada, idealmente debería ser "Detalles") */}
            <span className="inline-flex items-center gap-1">
              <Users size={14} aria-hidden="true" />
              <span className="font-medium">
                {capacidad ?? room.capacity ?? '-'}
              </span>
            </span>
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 sm:mt-0">
            {/* Fechas y Noches */}
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
          aria-label={`Eliminar paquete ${nombre ?? room.name ?? ''}`}
          title="Eliminar paquete"
          disabled={!room?.id}
          className={`flex h-8 w-8 transform items-center justify-center rounded-full text-red-600 transition duration-150 ease-in-out hover:scale-105 hover:bg-red-50 hover:text-red-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none dark:hover:bg-red-900/10 dark:hover:text-red-500`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default PackageCartItem;
