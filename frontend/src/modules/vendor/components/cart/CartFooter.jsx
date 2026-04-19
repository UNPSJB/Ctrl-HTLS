import { useState } from 'react';
import ClienteModal from '@client/ClienteModal';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';
import { useReservar } from '@vendor-hooks/useReservar';
import { formatCurrency } from '@utils/pricingUtils';

// Pie del carrito con resumen de totales y botón de reservar
function CartFooter({ onClose }) {
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const {
    totalOriginal,
    totalFinal,
    totalDescuento,
    globalTemporadaAlta,
    globalTemporadaBaja,
    globalDescuentoCantidad
  } = useCarritoPrecios();
  const { reservar, isReserving } = useReservar();

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
      <div className="flex flex-col gap-4 rounded-lg border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        
        {/* Ticket Breakdown */}
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(totalOriginal)}</span>
          </div>

          {(globalTemporadaBaja > 0 || globalTemporadaAlta > 0 || globalDescuentoCantidad > 0) && (
            <div className="my-1 border-t border-dashed border-gray-200 dark:border-gray-600" />
          )}

          {globalTemporadaBaja > 0 && (
            <div className="flex justify-between text-xs font-medium text-green-600 dark:text-green-400">
              <span>Descuento</span>
              <span>-{formatCurrency(globalTemporadaBaja)}</span>
            </div>
          )}

          {globalDescuentoCantidad > 0 && (
            <div className="flex justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
              <span>Desc. Habitaciones</span>
              <span>-{formatCurrency(globalDescuentoCantidad)}</span>
            </div>
          )}
          {globalTemporadaAlta > 0 && (
            <div className="flex justify-between text-xs font-medium text-red-600 dark:text-red-400">
              <span>Recargo</span>
              <span>+{formatCurrency(globalTemporadaAlta)}</span>
            </div>
          )}
          
          <div className="my-1 border-t border-gray-200 dark:border-gray-600" />

          {/* Gran Total */}
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalFinal)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleReservar}
          disabled={isDisabled || isReserving}
          className={`w-full rounded-md px-4 py-2.5 font-medium text-white transition-colors ${
            isDisabled || isReserving
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isReserving ? 'Reservando...' : 'Reservar'}
        </button>
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
