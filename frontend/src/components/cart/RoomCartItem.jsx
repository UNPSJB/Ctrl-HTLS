import { useCallback, useMemo } from 'react';
import { Trash2, House, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { calcRoomInstanceTotal } from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';
import { useCarrito } from '@context/CarritoContext';

const { formatFecha } = dateUtils;

function RoomCartItem({ room, hotel, onRemove = null }) {
  const { fechaInicio, fechaFin, precio = 0, nombre, capacidad } = room || {};

  const {
    original: originalTotal,
    final: finalTotal,
    nights,
  } = useMemo(() => {
    // Definimos el objeto 'limite' con las fechas de la temporada del hotel.
    // Si no hay temporada, será null y la función de cálculo lo manejará.
    const limiteTemporada = hotel?.temporada
      ? {
          fechaInicio: hotel.temporada.fechaInicio,
          fechaFin: hotel.temporada.fechaFin,
        }
      : null;

    return calcRoomInstanceTotal({
      precio: precio,
      porcentaje: hotel?.temporada?.porcentaje,
      alquiler: { fechaInicio, fechaFin },
      limite: limiteTemporada, // Pasamos el nuevo parámetro 'limite'
    });
  }, [precio, hotel?.temporada, fechaInicio, fechaFin]);

  const { removerHabitacion } = useCarrito();

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(room.id);
      return;
    }
    if (typeof removerHabitacion === 'function') {
      removerHabitacion(hotel?.hotelId, room.id);
    }
  }, [onRemove, removerHabitacion, hotel?.hotelId, room?.id]);

  if (!room) return null;

  return (
    <div className="mb-3 flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      <div className="min-w-0 flex-1">
        <h4 className="flex items-center gap-2 truncate font-medium text-gray-900 dark:text-gray-100">
          <House className="h-5 w-5 text-current" />
          <span className="truncate">{nombre ?? 'Habitación'}</span>
        </h4>

        <div className="mt-1 flex flex-col text-sm text-gray-600 dark:text-gray-300 sm:flex-row sm:items-center sm:gap-4">
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{capacidad ?? '-'}</span>
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 sm:mt-0">
            {formatFecha(fechaInicio)} — {formatFecha(fechaFin)} ({nights} noche
            {nights > 1 ? 's' : ''})
          </p>
        </div>
      </div>

      <div className="text-right">
        <PriceTag
          precio={finalTotal}
          original={finalTotal !== originalTotal ? originalTotal : undefined}
          seasonLayout="column"
        />
      </div>

      <div className="flex items-center">
        <button
          onClick={handleRemove}
          aria-label={`Eliminar habitación ${nombre ?? room.name ?? ''}`}
          title="Eliminar habitación"
          disabled={!room?.id}
          className={`flex h-8 w-8 transform items-center justify-center rounded-full text-red-600 transition duration-150 ease-in-out hover:scale-105 hover:bg-red-50 hover:text-red-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/10 dark:hover:text-red-300 dark:focus-visible:ring-red-700`}
        >
          <Trash2 className="h-5 w-5 text-current" />
        </button>
      </div>
    </div>
  );
}

export default RoomCartItem;
