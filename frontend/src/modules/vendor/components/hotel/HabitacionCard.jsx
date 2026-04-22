import { Users, Hash, Layers3, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { calcRoomInstanceTotal, formatCurrency } from '@utils/pricingUtils';
import { capitalizeWords } from '@/utils/stringUtils';
import DateDisplay from '@ui/DateDisplay';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';

// Tarjeta detallada para una instancia de habitación en el carrito (Vista de Pago)
function HabitacionCard({ habitacion, hotel, onRemove }) {
  if (!habitacion) return null;

  const { porHotel } = useCarritoPrecios();

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

  const hotelStats = porHotel[hotel?.hotelId] || {};
  const porcentajeDescCantidad = hotelStats.porcentajeDescCantidad || 0;

  const totalBase = priceInfo.original;
  const totalTemporada = priceInfo.final;
  const ajusteTemporadaMonto = totalTemporada - totalBase;
  const descuentoCantidadMonto = totalTemporada * porcentajeDescCantidad;
  const totalFinalHabitacion = totalTemporada - descuentoCantidadMonto;

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

      {/* Fila 2: Cronología */}
      <div className="px-1">
        <DateDisplay 
          fechaInicio={habitacion.fechaInicio} 
          fechaFin={habitacion.fechaFin} 
          noches={priceInfo.nights} 
        />
      </div>

      <div className="my-4 border-t border-gray-200/50 dark:border-gray-700/50" />

      {/* Fila 3: Desglose Económico y Precio Final */}
      <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Base:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(totalBase)}</span>
          </div>
          {priceInfo.hasSeasonalAdjustment && (
            <div className="flex items-center gap-2">
              <span>Ajuste por temporada ({ajusteTemporadaMonto > 0 ? '+' : '-'}{Math.round(hotel?.temporada?.porcentaje * 100)}%):</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(totalTemporada)}</span>
            </div>
          )}
          {porcentajeDescCantidad > 0 && (
            <div className="flex items-center gap-2">
              <span>Por habitaciones (-{Math.round(porcentajeDescCantidad * 100)}%):</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(totalFinalHabitacion)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Total
          </span>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {formatCurrency(totalFinalHabitacion)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HabitacionCard;
