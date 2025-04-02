const HabitacionItem = ({ habitacion, isSelected, onSelect }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
      {/* Checkbox e Información */}
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(habitacion.nombre)}
          className="w-5 h-5"
        />

        {/* Datos de la Habitación */}
        <div>
          <h4 className="text-md font-semibold">{habitacion.nombre}</h4>
          <p className="text-sm text-gray-600">
            Capacidad: {habitacion.capacidad} personas
          </p>
        </div>
      </div>

      {/* Precio y Botón */}
      <div className="flex items-center gap-4">
        <p className="text-md font-bold">${habitacion.precio}</p>
        <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default HabitacionItem;
