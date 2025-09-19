// PriceTag.jsx
// Muestra el precio y opcionalmente el precio original (tachado).
// Nuevo prop: seasonLayout -> 'column' | 'row' (por defecto: 'row')
// Estructura de componente requerida: función que retorna JSX y exportación por defecto.

function PriceTag({ precio = 0, original, seasonLayout = 'row' }) {
  // Formateador sencillo de moneda. Recomiendo moverlo a utils/formatting.js
  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value);

  const mostrarOriginal = typeof original === 'number' && original > precio;
  const isColumn = seasonLayout === 'column';

  // Seguridad: si seasonLayout recibe algo inválido, caemos en 'row'
  const layoutClass = isColumn
    ? 'flex-col items-center gap-2'
    : 'flex-row items-baseline gap-3';

  return (
    <>
      {mostrarOriginal ? (
        <div className={`flex ${layoutClass}`}>
          {/* Precio actual */}
          <p
            className={`text-md font-bold ${
              isColumn
                ? 'w-full text-green-600 dark:text-green-400 sm:w-auto'
                : 'text-green-600 dark:text-green-400'
            }`}
            aria-label={`Precio actual ${formatCurrency(precio)}`}
            title={`Precio: ${formatCurrency(precio)}`}
          >
            {formatCurrency(precio)}
          </p>

          {/* Precio original tachado */}
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
