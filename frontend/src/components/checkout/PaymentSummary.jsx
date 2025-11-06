import { useMemo } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';
import MetodoPago from './MetodoPago';
import FacturaSelector from './FacturaSelector';

function PaymentSummary() {
  const { carrito } = useCarrito();
  const { client } = useCliente();

  const { totalOriginal, totalFinal, descuentoTotal } = useMemo(() => {
    let originalSum = 0;
    let finalSum = 0;

    (carrito.hoteles || []).forEach((hotel) => {
      const porcentajeTemporada = hotel?.temporada?.porcentaje ?? 0;

      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          porcentaje: porcentajeTemporada,
          alquiler: { fechaInicio: room.fechaInicio, fechaFin: room.fechaFin },
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
      totalOriginal: originalSum,
      totalFinal: finalSum,
      descuentoTotal: originalSum - finalSum,
    };
  }, [carrito.hoteles]);

  const canConfirm = totalFinal > 0;

  return (
    <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        Resumen del Pago
      </h3>

      <div className="space-y-2 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            ${totalOriginal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Descuentos:</span>
          <span
            className={`font-medium ${descuentoTotal > 0 ? 'text-green-600' : 'text-gray-500'}`}
          >
            -${descuentoTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-3">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Total a Cubrir:
          </span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">
            ${totalFinal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <MetodoPago
          baseTotal={totalFinal}
          clientPoints={Number(client?.puntos ?? 0)}
        />

        <FacturaSelector />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => {}}
          disabled={!canConfirm}
          aria-disabled={!canConfirm}
          className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
            canConfirm
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          Finalizar Reserva y Pagar
        </button>
      </div>
    </div>
  );
}

export default PaymentSummary;
