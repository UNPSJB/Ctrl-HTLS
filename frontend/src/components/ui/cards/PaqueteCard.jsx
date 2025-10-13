import PriceTag from '@ui/PriceTag';
import { Users, Calendar } from 'lucide-react';
import { useMemo } from 'react';
import dateUtils from '@utils/dateUtils';
import { calcPackageTotal } from '@utils/pricingUtils';

const { formatFecha } = dateUtils;

function PaqueteCard({ paquete, hotel }) {
  if (!paquete) return null;

  // Obtenemos el desglose completo de precios
  const priceInfo = useMemo(() => {
    return calcPackageTotal({
      paquete,
      porcentaje: hotel?.temporada?.porcentaje,
    });
  }, [paquete, hotel]);

  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/60">
      {/* Fila Superior: Nombre y Precio Final */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {paquete.nombre}
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

      {/* Detalles del Paquete */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{paquete.habitaciones?.length || 1} Hab.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{paquete.noches} noches</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatFecha(paquete.fechaInicio)} — {formatFecha(paquete.fechaFin)}
        </div>
      </div>

      {/* Desglose de Precios del Paquete */}
      <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs dark:border-gray-600">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Suma de habitaciones por noche:</span>
          <span className="font-medium">${priceInfo.sumPerNight}</span>
        </div>
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal ({priceInfo.noches} noches):</span>
          <span className="font-medium">${priceInfo.original}</span>
        </div>
        {priceInfo.descuentoPaqueteMonto > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>
              Descuento del paquete (
              {(priceInfo.descuentoPaquetePorcentaje * 100).toFixed(0)}%):
            </span>
            <span className="font-medium">
              -${priceInfo.descuentoPaqueteMonto}
            </span>
          </div>
        )}
        {priceInfo.ajusteTemporadaMonto !== 0 && (
          <div
            className={`flex justify-between ${priceInfo.ajusteTemporadaMonto < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            <span>Ajuste por temporada:</span>
            <span className="font-medium">
              {priceInfo.ajusteTemporadaMonto < 0
                ? `-$${Math.abs(priceInfo.ajusteTemporadaMonto)}`
                : `+$${priceInfo.ajusteTemporadaMonto}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaqueteCard;
