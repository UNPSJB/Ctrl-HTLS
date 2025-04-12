const PaqueteCard = ({ paquete }) => {
  // Calcula el precio total con descuento para el paquete
  const precioHabitaciones = paquete.habitaciones.reduce(
    (suma, hab) => suma + hab.precio,
    0
  );
  const totalConDescuento =
    precioHabitaciones * paquete.noches * (1 - paquete.descuento / 100);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 dark:text-gray-100">
          {paquete.nombre}
        </h3>
        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
          ${totalConDescuento.toFixed(2)}
        </p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Noches: {paquete.noches} | Descuento: {paquete.descuento}%
      </p>
      <div className="mt-3">
        <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">
          Habitaciones Incluidas:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
          {paquete.habitaciones.map((hab) => (
            <li key={hab.id} className="flex items-center gap-1">
              • {hab.nombre} ({hab.capacidad} personas)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaqueteCard;
