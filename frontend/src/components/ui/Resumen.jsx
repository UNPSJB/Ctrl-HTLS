import PriceTag from '../PriceTag';
import { calcularTotalReserva } from '@utils/pricingUtils';

const Resumen = ({ habitaciones, paquetes, porcentaje = 1, isHighSeason }) => {
  const { totalFinal } = calcularTotalReserva(
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
