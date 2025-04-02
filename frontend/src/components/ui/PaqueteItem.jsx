const PaqueteItem = ({ paquete, isSelected, onSelect }) => {
  if (!paquete) return null;

  // Calcular precios
  const precioOriginal = paquete.habitaciones.reduce(
    (acc, hab) => acc + hab.precio,
    0
  );
  const precioConDescuento =
    precioOriginal - (precioOriginal * paquete.descuento) / 100;

  return (
    <div className="border rounded-md p-3 bg-gray-50 shadow-sm flex items-center gap-4">
      {/* Primera Columna: Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(paquete.nombre)}
        className="w-5 h-5"
      />

      {/* Segunda Columna: Información del paquete (2 filas) */}
      <div className="flex-1">
        <h4 className="text-md font-semibold">{paquete.nombre}</h4>
        <p className="text-sm text-gray-600">{paquete.descripcion}</p>
      </div>

      {/* Tercera Columna: Precios y Botón */}
      <div className="text-right flex flex-col items-end">
        {/* Fila 1: Precio con descuento y precio original en una sola línea */}
        <div className="flex items-center gap-2">
          <p className="text-md font-bold text-green-600">
            ${precioConDescuento.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 line-through">
            ${precioOriginal.toFixed(2)}
          </p>
        </div>

        {/* Fila 2: Botón (sin funcionalidad) */}
        <button className="text-blue-600 text-sm font-semibold hover:underline mt-2">
          Más Detalles
        </button>
      </div>
    </div>
  );
};

export default PaqueteItem;
