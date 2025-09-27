import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcularTotalCarrito } from '@utils/pricingUtils';
import ClienteModal from '../client/ClienteModal';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  // calcula totales usando util central (si no existe, fallback cero)
  const totals =
    typeof calcularTotalCarrito === 'function'
      ? calcularTotalCarrito(hotels ?? [])
      : { final: 0, original: 0, descuento: 0 };

  const handleReservar = () => {
    if (!hotels || hotels.length === 0) return;
    // Abrir modal de selección de cliente
    setIsClienteModalOpen(true);
  };

  const handleCloseClienteModal = () => {
    setIsClienteModalOpen(false);
  };

  const handleClienteSelected = (cliente) => {
    console.log('Cliente seleccionado para la reserva:', cliente);
    // El cliente ya se guarda en el contexto desde el modal
    setIsClienteModalOpen(false);
    // Cerrar carrito y navegar a la página de reserva
    onClose?.();
    navigate('/pago');
  };

  const isDisabled = !hotels || hotels.length === 0;

  return (
    <>
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${Number(totals.final ?? 0).toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleReservar}
            disabled={isDisabled}
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
              isDisabled
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-disabled={isDisabled}
            title="Reservar / Pagar"
          >
            Reservar
          </button>
        </div>
      </div>

      {/* Modal de búsqueda de clientes */}
      {isClienteModalOpen && (
        <ClienteModal
          onClose={handleCloseClienteModal}
          onClienteSelected={handleClienteSelected}
        />
      )}
    </>
  );
}

export default CartFooter;
