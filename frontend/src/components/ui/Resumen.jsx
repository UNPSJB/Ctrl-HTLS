import PriceTag from './PriceTag';
import { calcNights, calcCartTotal } from '@utils/pricingUtils';

function Resumen({
  habitaciones = [],
  paquetes = [],
  porcentaje = 0,
  isHighSeason,
}) {
  // Derivamos si es temporada alta a partir del porcentaje (por compatibilidad)
  const effectiveHighSeason =
    typeof isHighSeason === 'boolean'
      ? isHighSeason
      : Boolean(Number(porcentaje) > 0);

  /**
   * Adaptamos habitaciones y paquetes a la estructura que espera calcCartTotal:
   * [
   *   {
   *     hotel: { temporada: { porcentaje } }, // aquí usamos porcentaje para simular temporada
   *     selectedInstanceIds: [...],
   *     selectedPackageIds: [...],
   *     options: { nightsByInstance, qtyByInstance, packageQtyMap }
   *   }
   * ]
   */
  const selectedInstanceIds = habitaciones
    .map((h) => (h && h.id != null ? h.id : null))
    .filter((id) => id != null);

  const nightsByInstance = {};
  const qtyByInstance = {};
  habitaciones.forEach((h) => {
    if (!h || h.id == null) return;
    nightsByInstance[h.id] = calcNights(h.fechaInicio, h.fechaFin);
    qtyByInstance[h.id] =
      Number.isFinite(Number(h.qty)) && Number(h.qty) > 0 ? Number(h.qty) : 1;
  });

  const selectedPackageIds = paquetes
    .map((p) => (p && p.id != null ? p.id : null))
    .filter((id) => id != null);

  const packageQtyMap = {};
  paquetes.forEach((p) => {
    if (!p || p.id == null) return;
    packageQtyMap[p.id] =
      Number.isFinite(Number(p.qty)) && Number(p.qty) > 0 ? Number(p.qty) : 1;
  });

  const selections = [
    {
      hotel: {
        temporada: {
          porcentaje: effectiveHighSeason ? Number(porcentaje) || 0 : 0,
        },
      },
      selectedInstanceIds,
      selectedPackageIds,
      options: {
        nightsByInstance,
        qtyByInstance,
        packageQtyMap,
      },
    },
  ];

  const totals =
    typeof calcCartTotal === 'function'
      ? calcCartTotal(selections)
      : { final: 0, original: 0 };

  return (
    <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
      <div className="flex items-center justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
        <span>Total a Pagar:</span>
        <PriceTag precio={totals.final} original={totals.original} />
      </div>
    </div>
  );
}

export default Resumen;
