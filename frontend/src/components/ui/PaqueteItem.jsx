const PaqueteItem = ({ paquete, isSelected, onSelect }) => {
  if (!paquete) return null;

  const precioOriginal = paquete.habitaciones.reduce(
    (acc, hab) => acc + hab.precio,
    0
  );
  const precioConDescuento =
    precioOriginal - (precioOriginal * paquete.descuento) / 100;

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
        <div className="flex items-center gap-2">
          <p className="text-md font-bold text-green-600 dark:text-green-400">
            ${precioConDescuento.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
            ${precioOriginal.toFixed(2)}
          </p>
        </div>
        <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2">
          Más Detalles
        </button>
      </div>
    </div>
  );
};

export default PaqueteItem;
