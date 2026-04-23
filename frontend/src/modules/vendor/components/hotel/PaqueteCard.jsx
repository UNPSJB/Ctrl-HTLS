import { useState, useMemo } from 'react';
import { Users, Trash2, Package, ChevronDown, ChevronUp, BedDouble, Hash } from 'lucide-react';
import { calcPackageTotal, formatCurrency } from '@utils/pricingUtils';
import { capitalizeWords } from '@/utils/stringUtils';
import DateDisplay from '@ui/DateDisplay';
import PriceTag from '@ui/PriceTag';

// Tarjeta detallada para un paquete turístico en el carrito (Vista de Pago)
function PaqueteCard({ paquete, hotel, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priceInfo = useMemo(() => {
    return calcPackageTotal({
      paquete,
    });
  }, [paquete]);

  if (!paquete) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
      {/* Fila 1: Títulos y Acción */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {capitalizeWords(paquete.nombre)}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 rounded-full bg-blue-50/50 px-3 py-1 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-400"
            >
              <BedDouble className="h-4 w-4" />
              <span>{paquete.habitaciones?.length || 1} Habitaciones</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(paquete._cartId)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            title="Quitar paquete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Acordeón de Habitaciones */}
      {isExpanded && (
        <div className="bg-white/30 px-5 pb-4 dark:bg-black/10">
          <div className="rounded-lg border border-gray-100 bg-white/50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Detalle Operativo del Paquete</p>
            <div className="space-y-2">
              {paquete.habitaciones?.map((hab, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5 text-blue-500" />
                      <span className="font-bold">{hab.numero}</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="font-medium">{capitalizeWords(hab.nombre)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Piso {hab.piso}</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{hab.capacidad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-5 border-t border-gray-200/50 dark:border-gray-700/50" />

      {/* Fila 2: Cronología */}
      <div className="p-5">
        <DateDisplay
          fechaInicio={paquete.fechaInicio}
          fechaFin={paquete.fechaFin}
          noches={paquete.noches}
        />
      </div>

      <div className="mx-5 border-t border-gray-200/50 dark:border-gray-700/50" />

      {/* Fila 3: Desglose Económico y Precio Final */}
      <div className="flex flex-col items-end gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">

        <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Base:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatCurrency(priceInfo.sumPerNight * priceInfo.noches)}
            </span>
          </div>
          {priceInfo.descuentoPaquetePorcentaje > 0 && (
            <div className="flex items-center gap-2">
              <span>Descuento de paquete (-{Math.round(priceInfo.descuentoPaquetePorcentaje * 100)}%):</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(priceInfo.final)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
            Total
          </span>
          <PriceTag precio={priceInfo.final} />
        </div>
      </div>
    </div>
  );
}

export default PaqueteCard;
