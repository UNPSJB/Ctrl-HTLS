import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClienteModal from '../client/ClienteModal';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  const totals = useMemo(() => {
    let finalSum = 0;
    let originalSum = 0;

    (hotels || []).forEach((hotel) => {
      const porcentajeTemporada = hotel?.temporada?.porcentaje ?? 0;

      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          porcentaje: porcentajeTemporada,
          alquiler: {
            fechaInicio: room.fechaInicio,
            fechaFin: room.fechaFin,
          },
          limite: hotel.temporada,
        });
        originalSum += calc.original;
        finalSum += calc.final;
      });

      (hotel.paquetes || []).forEach((pack) => {
        const calc = calcPackageTotal({
          paquete: pack,
          porcentaje: porcentajeTemporada,
        });
        originalSum += calc.original;
        finalSum += calc.final;
      });
    });

    return {
      final: finalSum,
      original: originalSum,
      descuento: originalSum - finalSum,
    };
  }, [hotels]);

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

  const isDisabled = hotels.length === 0;

  const handleReservar = () => {
    if (isDisabled) return;
    setIsClienteModalOpen(true);
  };

  const handleCloseModal = (clienteSeleccionado) => {
    setIsClienteModalOpen(false);
    if (clienteSeleccionado) {
      navigate('/pago');
      if (typeof onClose === 'function') onClose();
    }
  };

  return (
    <>
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {currencyFormatter.format(totals.final)}
            </div>
            {totals.descuento > 0 && (
              // --- CAMBIO AQUÍ ---
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ahorrás: {currencyFormatter.format(totals.descuento)}
              </div>
            )}
          </div>
          <button
            onClick={handleReservar}
            disabled={isDisabled}
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
              isDisabled
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Reservar
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
