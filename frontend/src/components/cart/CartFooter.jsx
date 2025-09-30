import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Eliminamos calcNights (obsoleto)
import { calcCartTotal } from '@utils/pricingUtils';
// Importamos el hook de preparación de datos que creamos
import { useCartSelections } from '@hooks/useCartSelections';
import ClienteModal from '@client/ClienteModal';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  // Estado para controlar la visibilidad del modal. Inicialmente es false.
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  // 💥 CAMBIO CLAVE 1: Usamos useCartSelections para limpiar la preparación de datos.
  // La lógica para generar 'selections' se mueve al Custom Hook.
  const selections = useCartSelections(
    hotels.flatMap((h) => h.habitaciones || []) || [],
    hotels.flatMap((h) => h.paquetes || []) || [],
    0, // El porcentaje se aplica por hotel dentro de la utilidad central
    false
  );

  // Cálculo de totales
  const totals = useMemo(() => {
    // Ya no necesitas recrear la lógica de selección aquí, solo pasas 'selections'
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

  const handleCloseModal = () => {
    setIsClienteModalOpen(false);
    // Lógica para navegar después de seleccionar al cliente (si es necesario)
    navigate('/pago');
    if (onClose) onClose(); // Cierra el carrito (si está en un modal/sidebar)
  };

  return (
    <>
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          {/* ... Resto del resumen de precio (sin cambios) ... */}
        </div>

        <button
          onClick={handleReservar} // Llama a la función que valida y abre el modal
          disabled={isDisabled}
          className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
            isDisabled
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-disabled={isDisabled}
          title="Reservar / Pagar"
        >
          {/* El botón en el snippet no tenía contenido, asumimos uno estándar */}
          Continuar a Pago
        </button>
      </div>

      {/* 💥 CAMBIO CLAVE 2: Renderizado Condicional */}
      {isClienteModalOpen && (
        <ClienteModal
          onClose={handleCloseModal}
          // La selección del cliente y la navegación a checkout se manejan en ClienteModal
          onClienteSelected={handleCloseModal}
        />
      )}
    </>
  );
}

export default CartFooter;
