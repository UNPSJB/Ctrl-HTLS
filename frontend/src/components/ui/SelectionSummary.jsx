const SelectionSummary = ({
  selectedRoomsCount,
  selectedPackagesCount,
  totalPrice,
}) => {
  return (
    <div className="mt-4 bg-blue-50 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-blue-800">
          Seleccionados: {selectedRoomsCount} habitaciones,{' '}
          {selectedPackagesCount} paquetes
        </p>
        <p className="text-blue-600">Total: ${totalPrice.toFixed(2)}</p>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
        Reservar Selección
      </button>
    </div>
  );
};

export default SelectionSummary;
