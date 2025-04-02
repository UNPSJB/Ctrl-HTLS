const SelectionSummary = ({
  selectedRoomsCount,
  selectedPackagesCount,
  totalPrice,
}) => {
  return (
    <div className="mt-4 bg-blue-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-blue-800 dark:text-blue-400">
          Seleccionados: {selectedRoomsCount} habitaciones,{' '}
          {selectedPackagesCount} paquetes
        </p>
        <p className="text-blue-600 dark:text-blue-300">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>
      <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition">
        Reservar Selección
      </button>
    </div>
  );
};

export default SelectionSummary;
