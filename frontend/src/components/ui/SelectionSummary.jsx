import { useNavigate } from 'react-router-dom';

const SelectionSummary = ({
  selectedRoomsCount,
  selectedPackagesCount,
  totalPrice,
}) => {
  const navigate = useNavigate();

  const handleReservation = () => {
    navigate('/reserva');
  };

  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex justify-between items-center">
      <div>
        <p className="font-medium text-blue-900 dark:text-blue-100">
          Seleccionados: {selectedRoomsCount} habitaciones,{' '}
          {selectedPackagesCount} paquetes
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>
      <button
        onClick={handleReservation}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Reservar Selección
      </button>
    </div>
  );
};

export default SelectionSummary;
