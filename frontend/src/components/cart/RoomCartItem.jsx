import { useCallback, useMemo } from 'react';
import { Trash2, House, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
// Asegúrate de que tus utilidades se importen de esta forma
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

  // ✅ LÓGICA MANTENIDA: Usa useMemo para calcular los totales con la utilidad centralizada
  const { original: originalTotal, final: finalTotal } = useMemo(() => {
    // Tomamos el porcentaje de descuento de temporada del hotel (o 0 si no existe)
    const hotelSeasonDiscount = hotel?.temporada?.porcentaje ?? 0;

    // La instancia de habitación necesita el .price.
    // Usamos el `precio` que viene como prop/desestructurado para el cálculo.
    const roomInstance = { ...room, price: precio };

    return calcRoomInstanceTotal({
      roomInstance,
      nights,
      qty,
      hotelSeasonDiscount,
    });
  }, [room, hotel, nights, qty, precio]); // Dependencias: room, hotel, noches, cantidad y precio

  // Acciones del contexto
  const { removerHabitacion } = useCarrito();

  // ✅ LÓGICA MANTENIDA: Maneja la eliminación
  const handleRemove = useCallback(() => {
    if (onRemove) {
      // Si se pasa una función onRemove, la usa. (Se asume que onRemove usa room.id)
      onRemove(room.id);
    } else if (hotel?.hotelId && room?.id) {
      // Si no, usa la acción del contexto
      removerHabitacion(hotel.hotelId, room.id);
    }
  }, [onRemove, hotel?.hotelId, room?.id, removerHabitacion]);

  if (!room) return null;

  // 🎨 ESTILOS RESTAURADOS: Usamos la estética del primer componente
  return (
    // Contenedor principal con fondo redondeado y sombra ligera
    <div className="mb-3 flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
      {/* Columna 1: Datos habitación */}
      <div className="min-w-0 flex-1">
        {/* Nombre de la Habitación */}
        <h4 className="flex items-center gap-2 truncate font-medium text-gray-900 dark:text-gray-100">
          <House className="h-5 w-5 text-current" />
          <span className="truncate">
            {nombre ?? room.name ?? 'Habitación'}
          </span>
        </h4>

        {/* Detalles: Capacidad y Fechas/Noches */}
        <div className="mt-1 flex flex-col text-sm text-gray-600 dark:text-gray-300 sm:flex-row sm:items-center sm:gap-4">
          {/* Capacidad */}
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {capacidad ?? room.capacity ?? '-'}
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
          aria-label={`Eliminar habitación ${nombre ?? room.name ?? ''}`}
          title="Eliminar habitación"
          disabled={!room?.id}
          // Clases de botón restauradas de la versión de buena estética
          className={`flex h-8 w-8 transform items-center justify-center rounded-full text-red-600 transition duration-150 ease-in-out hover:scale-105 hover:bg-red-50 hover:text-red-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/10 dark:hover:text-red-300 dark:focus-visible:ring-red-700`}
        >
          <Trash2 className="h-5 w-5 text-current" />
        </button>
      </div>
    </div>
  );
}

export default RoomCartItem;
