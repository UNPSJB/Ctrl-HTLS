import { useCallback, useMemo } from 'react';
import { Trash2, House, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import pricingUtils from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';
import { useCarrito } from '@context/CarritoContext';

const { calcRoomInstanceTotal } = pricingUtils;
const { formatFecha, nightsBetween } = dateUtils;

function RoomCartItem({ room, hotel, onRemove = null }) {
  const {
    fechaInicio,
    fechaFin,
    precio = 0,
    qty = 1,
    nombre,
    capacidad,
  } = room || {};

  // Calculamos las noches
  const nights = nightsBetween(fechaInicio, fechaFin, { useUTC: true });

  // Usamos useMemo para calcular los totales con la utilidad centralizada
  const { original: originalTotal, final: finalTotal } = useMemo(() => {
    const hotelSeasonDiscount = hotel?.temporada?.porcentaje ?? 0;

    // La instancia de habitación necesita el .price.
    const roomInstance = { ...room, price: precio };

    return calcRoomInstanceTotal({
      roomInstance,
      nights,
      qty,
      hotelSeasonDiscount,
    });
  }, [room, hotel, nights, qty, precio]);

  // Acciones del contexto
  const { removerHabitacion } = useCarrito();

  // Maneja la eliminación
  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(room.id);
    } else if (hotel?.hotelId && room?.id) {
      removerHabitacion(hotel.hotelId, room.id);
    }
  }, [onRemove, hotel?.hotelId, room?.id, removerHabitacion]);

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
            {nombre ?? room.name ?? 'Habitación'}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {/* Capacidad */}
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
          aria-label={`Eliminar habitación ${nombre ?? room.name ?? ''}`}
          title="Eliminar habitación"
          disabled={!room?.id}
          className={`flex h-8 w-8 transform items-center justify-center rounded-full text-red-600 transition duration-150 ease-in-out hover:scale-105 hover:bg-red-50 hover:text-red-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:text-gray-400 disabled:shadow-none dark:hover:bg-red-900/10 dark:hover:text-red-500`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default RoomCartItem;
