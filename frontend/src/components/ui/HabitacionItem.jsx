const HabitacionItem = ({ habitacion, isSelected, onSelect }) => {
  if (!habitacion) return null;

  return (
    <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(habitacion.nombre)}
        className="w-5 h-5"
      />
      <div className="flex-1">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
          {habitacion.nombre}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Capacidad: {habitacion.capacidad} personas
        </p>
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="text-md font-bold text-gray-800 dark:text-gray-200">
          ${habitacion.precio.toFixed(2)}
        </p>
        <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2">
          Más Detalles
        </button>
      </div>
    </div>
  );
};

export default HabitacionItem;
