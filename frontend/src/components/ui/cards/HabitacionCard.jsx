import PriceTag from '@ui/PriceTag';
import { Users, Hash, Layers3, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { calcRoomInstanceTotal } from '@utils/pricingUtils';
import DateDisplay from '@ui/DateDisplay';

function HabitacionCard({ habitacion, hotel, onRemove }) {
  if (!habitacion) return null;

  const priceInfo = useMemo(() => {
    return calcRoomInstanceTotal({
      precio: habitacion.precio,
      porcentaje: hotel?.temporada?.porcentaje,
      alquiler: {
        fechaInicio: habitacion.fechaInicio,
        fechaFin: habitacion.fechaFin,
      },
      limite: hotel?.temporada,
    });
  }, [habitacion, hotel]);

  return (
    <div className="group relative rounded-lg bg-gray-50 p-4 dark:bg-gray-700/60">
      {onRemove && (
        <button
          onClick={() => onRemove(habitacion._cartId)}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          title="Quitar habitación"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}

      <div className="flex items-start justify-between pr-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {habitacion.nombre}
        </h3>
        <PriceTag
          precio={priceInfo.final}
          original={
            priceInfo.final !== priceInfo.original
              ? priceInfo.original
              : undefined
          }
        />
      </div>

      <hr className="my-3 border-gray-200 dark:border-gray-600" />

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>Capacidad: {habitacion.capacidad ?? '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span>Habitación Nº: {habitacion.numero}</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-gray-500" />
          <span>Piso: {habitacion.piso}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs dark:border-gray-600">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Precio por noche:</span>
          <span className="font-medium">${priceInfo.pricePerNight}</span>
        </div>
        {priceInfo.hasSeasonalAdjustment && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Precio noche (temporada):</span>
            <span className="font-medium">
              ${priceInfo.seasonalPricePerNight}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-1 font-semibold text-gray-700 dark:text-gray-300">
          <span>Total ({priceInfo.nights} noches):</span>
          <span>${priceInfo.final}</span>
        </div>
      </div>

      <hr className="my-3 border-gray-200 dark:border-gray-600" />

      <div className="flex items-center justify-end">
        <DateDisplay
          fechaInicio={habitacion.fechaInicio}
          fechaFin={habitacion.fechaFin}
        />
      </div>
    </div>
  );
}

export default HabitacionCard;
