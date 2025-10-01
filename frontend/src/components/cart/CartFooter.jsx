// CartFooter.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';
import ClienteModal from '../client/ClienteModal';

const { nightsBetween } = dateUtils;

/**
 * CartFooter corregido:
 * - Calcula totales iterando sobre las entradas del carrito (hotel.habitaciones son instancias).
 * - Usa calcRoomInstanceTotal / calcPackageTotal directamente.
 */
function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  // Calcular totales directamente a partir del carrito (entradas ya contienen instancias)
  const totals = useMemo(() => {
    let originalSum = 0;
    let finalSum = 0;

    (hotels || []).forEach((hotel) => {
      const hotelSeasonDiscount = hotel?.temporada?.porcentaje ?? 0;

      // habitaciones (cada 'room' es una instancia agregada al carrito)
      (hotel.habitaciones || []).forEach((room) => {
        // nightsBetween puede devolver NaN si fechas inválidas => fallback a 1
        let nights = 1;
        try {
          const maybe = nightsBetween(room.fechaInicio, room.fechaFin, {
            useUTC: true,
          });
          nights =
            Number.isFinite(Number(maybe)) && Number(maybe) > 0
              ? Math.floor(Number(maybe))
              : 1;
        } catch (err) {
          nights = 1;
        }

        const qty = room.qty ?? 1;
        // calcRoomInstanceTotal espera roomInstance.price
        const roomInstance = {
          ...room,
          price: room.precio ?? room.price ?? 0,
        };
        const { original = 0, final = 0 } = calcRoomInstanceTotal({
          roomInstance,
          nights,
          qty,
          hotelSeasonDiscount,
        });

        originalSum += Number(original ?? 0);
        finalSum += Number(final ?? 0);
      });

      // paquetes
      (hotel.paquetes || []).forEach((pack) => {
        const qty = pack.qty ?? 1;
        const { original = 0, final = 0 } = calcPackageTotal({
          paquete: pack,
          qty,
          hotelSeasonDiscount,
        });

        originalSum += Number(original ?? 0);
        finalSum += Number(final ?? 0);
      });
    });

    const descuento = Math.max(
      0,
      Math.round(Number(originalSum) - Number(finalSum))
    );

    return {
      original: Math.round(Number(originalSum)),
      final: Math.round(Number(finalSum)),
      descuento,
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

  const isDisabled = !Array.isArray(hotels) || hotels.length === 0;

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
              {currencyFormatter.format(Number(totals.final ?? 0))}
            </div>

            {Number(totals.descuento ?? 0) > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ahorrás:{' '}
                {currencyFormatter.format(Number(totals.descuento ?? 0))}
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
            aria-disabled={isDisabled}
            title="Reservar / Pagar"
            type="button"
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
