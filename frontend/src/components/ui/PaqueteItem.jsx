const PaqueteItem = ({ paquete, coeficiente, isSelected, onSelect }) => {
  if (!paquete) return null;

  // Precio del paquete ya con su descuento aplicado
  const packagePrice =
    paquete.habitaciones.reduce((acc, hab) => acc + hab.precio, 0) *
    (1 - paquete.descuento / 100);

  // Aplicar coeficiente de descuento solo si es distinto de 1
  const finalPrice =
    coeficiente !== 1 ? packagePrice * (1 - coeficiente) : packagePrice;

  return (
    <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(paquete.nombre)}
        className="w-5 h-5"
      />
      <div className="flex-1">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          {paquete.nombre}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {paquete.descripcion}
        </p>
      </div>
      <div className="text-right flex flex-col items-end">
        {coeficiente !== 1 ? (
          // Si hay coeficiente, se muestra como descuento
          <div className="flex items-center gap-2">
            <p className="text-md font-bold text-green-600 dark:text-green-400">
              ${finalPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
              ${packagePrice.toFixed(2)}
            </p>
          </div>
        ) : (
          // Si no hay coeficiente, se muestra como precio normal
          <p className="text-md font-bold text-gray-800 dark:text-gray-200">
            ${packagePrice.toFixed(2)}
          </p>
        )}
        <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2">
          Más Detalles
        </button>
      </div>
    </div>
  );
};

export default PaqueteItem;
