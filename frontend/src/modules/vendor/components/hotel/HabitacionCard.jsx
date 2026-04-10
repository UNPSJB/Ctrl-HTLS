import PriceTag from '@ui/PriceTag';
import { Users, Hash, Layers3, Trash2, CalendarDays, ArrowRight, Moon } from 'lucide-react';
import { useMemo } from 'react';
import { calcRoomInstanceTotal } from '@utils/pricingUtils';
import { capitalizeWords } from '@/utils/stringUtils';
import dateUtils from '@utils/dateUtils';

const { formatFecha } = dateUtils;

// Tarjeta detallada para una instancia de habitación en el carrito (Vista de Pago)
function HabitacionCard({ habitacion, hotel, onRemove }) {
  if (!habitacion) return null;

  const priceInfo = useMemo(() => {
    return calcRoomInstanceTotal({
      precio: habitacion.precio,
      temporada: hotel?.temporada,
      alquiler: {
        fechaInicio: habitacion.fechaInicio,
        fechaFin: habitacion.fechaFin,
      },
    });
  }, [habitacion, hotel]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
      {/* Fila 1: Títulos, Detalles Técnicos y Acción */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {capitalizeWords(habitacion.nombre)}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5" title="Capacidad">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{habitacion.capacidad ?? '-'}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Número de habitación">
              <Hash className="h-4 w-4 text-blue-500" />
              <span>{habitacion.numero}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Piso">
              <Layers3 className="h-4 w-4 text-blue-500" />
              <span>Piso {habitacion.piso}</span>
            </div>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(habitacion._cartId)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            title="Quitar habitación"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="my-4 border-t border-gray-200/50 dark:border-gray-700/50" />

      {/* Fila 2: Cronología Personalizada */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-in</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatFecha(habitacion.fechaInicio)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-out</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatFecha(habitacion.fechaFin)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Moon className="h-4 w-4" />
          <span>{priceInfo.nights} NOCHES</span>
        </div>
      </div>

      <div className="my-4 border-t border-gray-200/50 dark:border-gray-700/50" />

      {/* Fila 3: Desbloce Económico y Precio Final */}
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Precio base p/noche:</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">${priceInfo.pricePerNight}</span>
          </div>
          {priceInfo.hasSeasonalAdjustment && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span>Incluye ajuste de temporada ({hotel?.temporada?.porcentaje * 100}%):</span>
              <span className="font-bold">${priceInfo.seasonalPricePerNight}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-tighter text-gray-400 dark:text-gray-500">
            Subtotal
          </span>
          <div className="text-lg font-black text-gray-900 dark:text-white">
            <PriceTag precio={priceInfo.final} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HabitacionCard;
