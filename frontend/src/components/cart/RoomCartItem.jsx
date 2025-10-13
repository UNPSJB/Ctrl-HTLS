import { useCallback, useMemo } from 'react';
import { Trash2, House, Users, Hash } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { calcRoomInstanceTotal } from '@utils/pricingUtils';
import { useCarrito } from '@context/CarritoContext';
import DateDisplay from '@ui/DateDisplay';

function RoomCartItem({ room, hotel, onRemove = null }) {
  const {
    fechaInicio,
    fechaFin,
    precio = 0,
    nombre,
    capacidad,
    numero,
  } = room || {};

  const { final: finalTotal } = useMemo(() => {
    return calcRoomInstanceTotal({
      precio: precio,
      porcentaje: hotel?.temporada?.porcentaje,
      alquiler: { fechaInicio, fechaFin },
      limite: hotel?.temporada,
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
        {/* Fila 1: Nombre, Detalles y Precio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="flex items-center gap-2 truncate font-semibold text-gray-900 dark:text-gray-100">
              <House className="h-5 w-5 flex-shrink-0 text-current" />
              <span className="truncate">{nombre ?? 'Habitación'}</span>
            </h4>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{capacidad ?? '-'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Hash className="h-4 w-4" />
                <span>{numero ?? '-'}</span>
              </div>
            </div>
          </div>
          <PriceTag precio={finalTotal} />
        </div>

        {/* Fila 2: Fechas y Botón de Eliminar */}
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
          <DateDisplay fechaInicio={fechaInicio} fechaFin={fechaFin} />
          <button
            onClick={handleRemove}
            aria-label={`Eliminar habitación ${nombre ?? ''}`}
            title="Eliminar habitación"
            disabled={!room?.id}
            className="group rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomCartItem;
