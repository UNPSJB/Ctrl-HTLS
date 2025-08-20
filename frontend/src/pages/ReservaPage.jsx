import { useCliente } from '@context/ClienteContext';
import { useNavigate } from 'react-router-dom';
import Cliente from '@components/Cliente';
import HotelsListView from '@components/HotelsListView';

function ReservaPage() {
  const { client } = useCliente();
  const navigate = useNavigate();

  const handleGoToPago = () => {
    if (!client) {
      alert('Seleccioná un cliente antes de continuar al pago.');
      return;
    }
    navigate('/pago');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <HotelsListView />
      <Cliente />
      <div className="flex justify-end gap-3">
        <button
          onClick={handleGoToPago}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Pagar
        </button>
      </div>
    </div>
  );
}

export default ReservaPage;
