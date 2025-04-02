const HabitacionItem = ({ habitacion, isSelected, onSelect }) => {
  if (!habitacion) return null;

  return (
    <div className="border rounded-md p-3 bg-gray-50 shadow-sm flex items-center gap-4">
      {/* Primera Columna: Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(habitacion.nombre)}
        className="w-5 h-5"
      />

      {/* Segunda Columna: Información de la habitación (2 filas) */}
      <div className="flex-1">
        <h4 className="text-md font-semibold">{habitacion.nombre}</h4>
        <p className="text-sm text-gray-600">
          Capacidad: {habitacion.capacidad} personas
        </p>
      </div>

      {/* Tercera Columna: Precio y Botón */}
      <div className="text-right flex flex-col items-end">
        {/* Fila 1: Precio */}
        <p className="text-md font-bold text-gray-800">
          ${habitacion.precio.toFixed(2)}
        </p>

        {/* Fila 2: Botón (sin funcionalidad aún) */}
        <button className="text-blue-600 text-sm font-semibold hover:underline mt-2">
          Más Detalles
        </button>
      </div>
    </div>
  );
};

export default HabitacionItem;
