// src/components/cart/RoomCartItem.jsx
import { Trash2, House } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import {
  calcularPrecioFinalHabitacion,
  // En caso de que uses la versión refactor en inglés, el alias existe en tu util
  // calcRoomFinal
} from '@utils/pricingUtils'; // usa la implementación actual (español) para compatibilidad

// Item presentacional de habitación (visual-only)
function RoomCartItem({ room = {}, hotel = {}, onRemove: onRemoveProp }) {
  const { removerHabitacion } = useCarrito();
  const onRemove =
    onRemoveProp || (() => removerHabitacion(hotel.idHotel, room.id));

  // calcular precio visual — si la util no existe, fallback simple
  const computed =
    typeof calcularPrecioFinalHabitacion === 'function'
      ? calcularPrecioFinalHabitacion({
          habitacion: room,
          descuentoHotel: hotel.coeficiente ?? 0,
        })
      : { final: Number(room.precio ?? room.price ?? 0) };

  return (
    <div className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
      <div className="flex-1">
        <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
          <House className="w-5 h-5 text-current" />
          <span>{room.nombre}</span>
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
        aria-label={`Eliminar habitación ${room.nombre}`}
        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        title="Eliminar habitación"
      >
        <Trash2 className="w-5 h-5 text-current" />
      </button>
    </div>
  );
}

export default RoomCartItem;
