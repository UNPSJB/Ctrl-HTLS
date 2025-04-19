import PriceTag from '../PriceTag';
import { calculateReservationTotal } from '@utils/pricingUtils';

const Resumen = ({ habitaciones, paquetes, porcentaje = 1, isHighSeason }) => {
  // Usar la utilidad para calcular totales
  const { totalFinal } = calculateReservationTotal(
    habitaciones,
    paquetes,
    isHighSeason,
    porcentaje
  );

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
        <span>Total a Pagar:</span>
        <PriceTag precio={totalFinal} coeficiente={porcentaje} />
      </div>
    </div>
  );
};

export default Resumen;
