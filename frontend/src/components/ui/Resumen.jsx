import PriceTag from './PriceTag';
import { calcularTotalReserva } from '@utils/pricingUtils';

function Resumen({
  habitaciones = [],
  paquetes = [],
  porcentaje = 0,
  isHighSeason,
}) {
  // Si no nos pasan isHighSeason lo derivamos del porcentaje (si hay coeficiente > 0)
  const effectiveHighSeason =
    typeof isHighSeason === 'boolean'
      ? isHighSeason
      : Boolean(Number(porcentaje) > 0);

  const { totalOriginal, totalFinal } = calcularTotalReserva(
    habitaciones,
    paquetes,
    effectiveHighSeason,
    Number(porcentaje) || 0
  );

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
        <span>Total a Pagar:</span>
        {/* Usamos original + final para que PriceTag muestre tachado si corresponde */}
        <PriceTag precio={totalFinal} original={totalOriginal} />
      </div>
    </div>
  );
}

export default Resumen;
