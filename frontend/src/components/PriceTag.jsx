import { applySeasonDiscount } from '../utils/price';

const PriceTag = ({ precio, coeficiente }) => {
  // Se usa la función para calcular el precio final con descuento
  const discountedPrice = applySeasonDiscount(precio, coeficiente);

  return (
    <>
      {coeficiente !== 1 ? (
        <div className="flex items-center gap-2">
          <p className="text-md font-bold text-green-600 dark:text-green-400">
            ${discountedPrice.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
            ${precio.toFixed(2)}
          </p>
        </div>
      ) : (
        <p className="text-md font-bold text-gray-800 dark:text-gray-200">
          ${precio.toFixed(2)}
        </p>
      )}
    </>
  );
};

export default PriceTag;
