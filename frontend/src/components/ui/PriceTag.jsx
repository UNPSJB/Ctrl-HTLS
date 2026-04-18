import { formatCurrency } from '@utils/pricingUtils';

// Componente para mostrar precios con formato de moneda ARS
function PriceTag({ precio = 0, original, seasonLayout = 'row' }) {
  const hasOriginal = typeof original === 'number';
  const isDiscount = hasOriginal && original > precio;
  const isSurcharge = hasOriginal && original < precio;
  const mostrarOriginal = isDiscount || isSurcharge;

  const isColumn = seasonLayout === 'column';

  const layoutClass = isColumn
    ? 'flex-col items-center gap-2'
    : 'flex-row items-baseline gap-3';

  const mainColorClass = isDiscount
    ? 'text-green-600 dark:text-green-400'
    : isSurcharge
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-800 dark:text-gray-200';

  return (
    <>
      {mostrarOriginal ? (
        <div className={`flex ${layoutClass}`}>
          { }
          <p
            className={`text-md font-bold ${isColumn ? `w-full ${mainColorClass} sm:w-auto` : mainColorClass}`}
            aria-label={`Precio actual ${formatCurrency(precio)}`}
            title={`Precio: ${formatCurrency(precio)}`}
          >
            {formatCurrency(precio)}
          </p>

          { }
          <p
            className={`${isColumn ? 'w-full text-sm text-gray-500 line-through dark:text-gray-400 sm:w-auto' : 'text-sm text-gray-500 line-through dark:text-gray-400'}`}
            aria-label={`Precio original ${formatCurrency(original)}`}
            title={`Precio original: ${formatCurrency(original)}`}
          >
            {formatCurrency(original)}
          </p>
        </div>
      ) : (
        <p
          className="text-md font-bold text-gray-800 dark:text-gray-200"
          aria-label={`Precio ${formatCurrency(precio)}`}
        >
          {formatCurrency(precio)}
        </p>
      )}
    </>
  );
}

export default PriceTag;
