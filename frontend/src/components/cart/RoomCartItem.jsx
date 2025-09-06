import { Trash2, House, Users } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { normalizarDescuento, roundTwo } from '@utils/pricingUtils';
import { formatFecha, nightsBetween } from '@utils/dateUtils';

function RoomCartItem({ room, hotel, onRemove = () => {} }) {
  const {
    fechaInicio,
    fechaFin,
    precio = 0,
    qty = 1,
    nombre,
    capacidad,
  } = room;

  const nights = nightsBetween(fechaInicio, fechaFin, { useUTC: true });

  // temporada / coeficiente
  const temporada = hotel?.temporada ?? hotel?.season ?? '';
  const coef = Number(hotel?.coeficiente ?? hotel?.coefficient ?? 0);

  const esAlta = String(temporada).toLowerCase() === 'alta';
  const desc = esAlta ? normalizarDescuento(coef) : 0;

  // precio por noche final y totals
  const precioPorNoche = roundTwo(Number(precio) * (1 - desc));
  const finalTotal = roundTwo(precioPorNoche * qty * nights);
  const originalTotal = roundTwo(Number(precio) * qty * nights);

  return (
    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
      {/* Columna 1: Datos habitación */}
      <div className="flex-1 min-w-0">
        <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 truncate">
          <House className="w-5 h-5 text-current" />
          <span className="truncate">
            {nombre ?? room.name ?? 'Habitación'}
          </span>
        </h4>

        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 dark:text-gray-300">
          <p className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-medium">
              {capacidad ?? room.capacity ?? '-'}
            </span>
          </p>

          <p className="mt-2 sm:mt-0 text-xs text-gray-500 dark:text-gray-400">
            {formatFecha(fechaInicio)} — {formatFecha(fechaFin)} ({nights} noche
            {nights > 1 ? 's' : ''})
          </p>
        </div>
      </div>

      {/* Columna 2: Precio */}
      <div className="text-right">
        <PriceTag
          precio={finalTotal}
          original={originalTotal > finalTotal ? originalTotal : undefined}
        />
      </div>

      {/* Columna 3: Botón eliminar */}
      <div className="flex items-center">
        <button
          onClick={onRemove}
          aria-label={`Eliminar habitación ${nombre ?? room.name ?? ''}`}
          className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          title="Eliminar habitación"
        >
          <Trash2 className="w-5 h-5 text-current" />
        </button>
      </div>
    </div>
  );
}

export default RoomCartItem;
