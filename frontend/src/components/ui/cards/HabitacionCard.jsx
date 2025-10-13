import PriceTag from '@ui/PriceTag';
import { Users, Hash, Layers3 } from 'lucide-react';
import { useMemo } from 'react';
import dateUtils from '@utils/dateUtils';
import { calcRoomInstanceTotal } from '@utils/pricingUtils';

const { formatFecha } = dateUtils;

function HabitacionCard({ habitacion, hotel }) {
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
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/60">
      <div className="flex items-start justify-between">
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
            <span>Precio por noche (descuento por temporada):</span>
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
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatFecha(habitacion.fechaInicio)} —{' '}
          {formatFecha(habitacion.fechaFin)}
        </div>
      </div>
    </div>
  );
}

export default HabitacionCard;
