import { useMemo, useState } from 'react';
import ClienteModal from '@client/ClienteModal';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';
import { useReservar } from '@vendor-hooks/useReservar';

// Pie del carrito con resumen de totales y botón de reservar
function CartFooter({ onClose }) {
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const { totalFinal, totalDescuento } = useCarritoPrecios();
  const { reservar, isReserving } = useReservar();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const isDisabled = totalFinal <= 0;

  const handleReservar = () => {
    if (isDisabled || isReserving) return;
    setIsClienteModalOpen(true);
  };

  const handleCloseModal = async (clienteSeleccionado) => {
    if (!clienteSeleccionado) {
      setIsClienteModalOpen(false);
      return;
    }

    setIsClienteModalOpen(false);
    await reservar(clienteSeleccionado);
    if (typeof onClose === 'function') onClose();
  };

  return (
    <>
      {/* Resumen de totales y acción de reserva */}
      <div className="rounded-lg border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {currencyFormatter.format(totalFinal)}
            </div>
            {totalDescuento > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ahorrás: {currencyFormatter.format(totalDescuento)}
              </div>
            )}
          </div>
          <button
            onClick={handleReservar}
            disabled={isDisabled || isReserving}
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${isDisabled || isReserving
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isReserving ? 'Reservando...' : 'Reservar'}
          </button>
        </div>
      </div>

      {isClienteModalOpen && (
        <ClienteModal
          onClose={() => setIsClienteModalOpen(false)}
          onClienteSelected={handleCloseModal}
        />
      )}
    </>
  );
}

export default CartFooter;
