import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcCartTotal } from '@utils/pricingUtils';
import { useCartSelections } from '@hooks/useCartSelections';
import ClienteModal from '../client/ClienteModal';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  // Estado para controlar la visibilidad del modal. Inicialmente es false.
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  // 1. Lógica de selección centralizada (limpieza funcional)
  const selections = useCartSelections(
    hotels.flatMap((h) => h.habitaciones || []) || [],
    hotels.flatMap((h) => h.paquetes || []) || [],
    0, // Porcentaje de temporada (la lógica ya está dentro de calcCartTotal)
    false
  );

  // 2. Cálculo de totales (optimizado con useMemo)
  const totals = useMemo(() => {
    return calcCartTotal(selections);
  }, [selections]);

  // Lógica para deshabilitar el botón
  const isDisabled = !hotels || hotels.length === 0;

  // Handler para el botón de reservar
  const handleReservar = () => {
    if (!isDisabled) {
      // Abre el modal solo si el botón NO está deshabilitado
      setIsClienteModalOpen(true);
    }
  };

  const handleCloseModal = (clienteSeleccionado) => {
    setIsClienteModalOpen(false);
    // Si se selecciona un cliente (onClienteSelected lo dispara), navegar a la página de pago
    if (clienteSeleccionado) {
      navigate('/pago');
      if (onClose) onClose(); // Cierra el carrito
    }
  };

  return (
    <>
      {/* RESTAURACIÓN DE MARKUP Y CLASES DE LA VERSIÓN ANTIGUA */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            {/* Título de total */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </div>
            {/* Monto final */}
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${Number(totals.final ?? 0).toFixed(2)}
            </div>
            {/* Descuento: información funcional, respetando las clases */}
            {Number(totals.descuento ?? 0) > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ahorrás: ${Number(totals.descuento ?? 0).toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={handleReservar} // Llama a la función que valida y abre el modal
            disabled={isDisabled}
            // Clases de Tailwind RESTAURADAS de la versión correcta
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

      {/* Renderizado Condicional del Modal */}
      {isClienteModalOpen && (
        <ClienteModal
          // La función onClose se usa para cerrar el modal (sin acción de navegación)
          onClose={() => setIsClienteModalOpen(false)}
          // onClienteSelected maneja la selección y la navegación a /pago
          onClienteSelected={handleCloseModal}
        />
      )}
    </>
  );
}

export default CartFooter;
