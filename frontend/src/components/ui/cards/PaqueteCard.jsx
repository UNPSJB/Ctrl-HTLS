import PriceTag from '@ui/PriceTag';
import { Users } from 'lucide-react';
import { useMemo } from 'react';

// Se agrega la nueva utilidad a la importación
import {
  calcPackageTotal,
  normalizeDiscount,
  calcPackageBasePricePerNight, // NUEVA UTILIDAD IMPORTADA
} from '@utils/pricingUtils';

// Importamos la utilidad de fechas/noches desde dateUtils.
import dateUtils from '@utils/dateUtils';

const { nightsBetween } = dateUtils;

function PaqueteCard({ paquete, porcentaje = 0 }) {
  if (!paquete) return null;

  // Cálculo de noches (ya corregido en el paso anterior)
  const noches = nightsBetween(paquete?.fechaInicio, paquete?.fechaFin);

  // 1. Precio base por noche (suma de precios de habitación)
  // CAMBIO CLAVE: Lógica compleja movida a la utilidad.
  const sumaPorNoche = useMemo(() => {
    // LLAMAMOS DIRECTAMENTE A LA UTILIDAD CENTRALIZADA
    return calcPackageBasePricePerNight(paquete);
  }, [paquete]);

  // 2. Precio final del paquete usando la util central (retorna enteros)
  const infoFinal = useMemo(() => {
    return typeof calcPackageTotal === 'function'
      ? calcPackageTotal({
          paquete: {
            ...paquete,
            // Aseguramos que el campo noches esté definido si calcPackageTotal lo usa
            noches: paquete?.noches || noches,
          },
          hotelSeasonDiscount: porcentaje ?? 0,
          qty: paquete?.qty ?? 1,
        })
      : { final: 0, original: 0, noches, qty: paquete?.qty ?? 1 };
  }, [paquete, porcentaje, noches]);

  const precioBasePorNoche = sumaPorNoche;
  const precioTotalFinal = Number(infoFinal.final ?? 0);
  const precioTotalOriginal = Number(infoFinal.original ?? precioTotalFinal);

  // Mostrar descuento del paquete en formato legible (ej. "10%")
  const displayPaqueteDesc =
    typeof paquete?.descuento !== 'undefined'
      ? `${Math.round((normalizeDiscount(paquete.descuento) || 0) * 100)}%`
      : '0%';

  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {paquete?.nombre}
          </h3>
          <div className="mx-4 border-l border-gray-300 dark:border-gray-600" />
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            Incluye {paquete?.habitaciones?.length ?? 0} habitación
            {(paquete?.habitaciones?.length ?? 0) !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Precio base por noche (suma de precios por noche sin aplicar noches ni descuentos) */}
        <PriceTag precio={precioBasePorNoche} />
      </div>

      <hr className="my-4 border-gray-300 dark:border-gray-600" />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Noches: {noches} | Descuento: {displayPaqueteDesc}
        </div>

        {/* Precio final: total para el paquete considerando noches y descuentos */}
        <PriceTag
          precio={precioTotalFinal}
          original={
            precioTotalOriginal > precioTotalFinal
              ? precioTotalOriginal
              : undefined
          }
        />
      </div>

      <div className="mt-3">
        <p className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          Habitaciones Incluidas:
        </p>
        <ul className="grid grid-cols-2 gap-1 text-sm text-gray-600 dark:text-gray-400">
          {(paquete?.habitaciones || []).map((hab, idx) => (
            <li key={hab?.id ?? idx} className="flex flex-col gap-1">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {hab?.nombre ?? `Habitación ${idx + 1}`} (
                {hab?.capacidad ?? '-'} personas)
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ${Number(hab?.precio ?? 0).toFixed(0)} por noche{' '}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PaqueteCard;
