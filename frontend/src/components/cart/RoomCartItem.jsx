import { useCallback } from 'react';
import { Trash2, House, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { normalizeDiscount, roundTwo } from '@utils/pricingUtils';
import { formatFecha, nightsBetween } from '@utils/dateUtils';
import { useCarrito } from '@context/CarritoContext';

function RoomCartItem({ room, hotel, onRemove = null }) {
  const {
    fechaInicio,
    fechaFin,
    precio = 0,
    qty = 1,
    nombre,
    capacidad,
  } = room || {};

  const nights = nightsBetween(fechaInicio, fechaFin, { useUTC: true });

  // Calcular precio con temporada (si existe). Ahora usamos hotel.temporada.porcentaje
  let precioPorNoche = Number(precio);
  let originalTotal = roundTwo(precioPorNoche * qty * nights);
  let finalTotal = originalTotal;

  if (hotel?.temporada) {
    const descTemporada = normalizeDiscount(hotel.temporada.porcentaje);
    precioPorNoche = roundTwo(Number(precio) * (1 - descTemporada));
    finalTotal = roundTwo(precioPorNoche * qty * nights);
  }

  // Acciones del contexto
  const { removerHabitacion } = useCarrito();

  // Maneja la eliminación: si viene onRemove lo usa, sino usa el contexto.
  const handleRemove = useCallback(() => {
    if (typeof onRemove === 'function') {
      onRemove(room);
      return;
    }

    if (!room?.id) {
      console.warn(
        'RoomCartItem: no se encontró room.id — la acción removerHabitacion requiere un id único.'
      );
      return;
    }

    // Llamada directa al contexto usando hotelId (nuevo nombre)
    removerHabitacion(hotel?.hotelId ?? '', room.id);
  }, [onRemove, room, removerHabitacion, hotel]);

  if (!room) return null;

  return (
    <div className="mb-3 flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      {/* Columna 1: Datos habitación */}
      <div className="min-w-0 flex-1">
        <h4 className="flex items-center gap-2 truncate font-medium text-gray-900 dark:text-gray-100">
          <House className="h-5 w-5 text-current" />
          <span className="truncate">
            {nombre ?? room.name ?? 'Habitación'}
          </span>
        </h4>

        <div className="mt-1 flex flex-col text-sm text-gray-600 dark:text-gray-300 sm:flex-row sm:items-center sm:gap-4">
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {capacidad ?? room.capacity ?? '-'}
            </span>
          </p>

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
