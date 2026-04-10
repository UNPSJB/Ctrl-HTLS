import { useState } from 'react';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';
import { usePagar } from '@vendor-hooks/usePagar';
import { useCliente } from '@vendor-context/ClienteContext';
import { formatCurrency } from '@utils/pricingUtils';
import MetodoPago from './MetodoPago';
import FacturaSelector from './FacturaSelector';

// Resumen final de la transacción y procesamiento del pago
function PaymentSummary() {
  const { client } = useCliente();
  const { porHotel, totalFinal } = useCarritoPrecios();
  const { pagar, isProcessing, canConfirm } = usePagar();

  // Estados locales que antes estaban en PagoContext
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [tipoFactura, setTipoFactura] = useState('B');
  const [montoEfectivo, setMontoEfectivo] = useState(0);
  const [cardData, setCardData] = useState(null);

  const montoTarjetaCálculo = totalFinal - (Number(montoEfectivo) || 0);

  // Calcular desglose agregado desde porHotel
  const breakdown = (() => {
    let subtotalHabitaciones = 0;
    let ajusteTemporadaHabs = 0;
    let descuentoCantidad = 0;
    let subtotalPaquetes = 0;
    let descuentoPaquetes = 0;
    let ajusteTemporadaPaquetes = 0;

    Object.values(porHotel).forEach((h) => {
      subtotalHabitaciones += h.subtotalHabsOriginal;
      ajusteTemporadaHabs += h.ajusteTemporadaHabs;
      descuentoCantidad += h.descuentoCantidad;
      subtotalPaquetes += h.subtotalPaquetesOriginal;
      descuentoPaquetes += h.descuentoPaquetes;
      ajusteTemporadaPaquetes += h.ajusteTemporadaPaquetes;
    });

    return {
      subtotalHabitaciones,
      ajusteTemporadaHabs,
      descuentoCantidad,
      subtotalPaquetes,
      descuentoPaquetes,
      ajusteTemporadaPaquetes,
    };
  })();

  const tieneHabitaciones = breakdown.subtotalHabitaciones > 0;
  const tienePaquetes = breakdown.subtotalPaquetes > 0;

  const handlePagar = () => {
    pagar({
      metodoPago,
      tipoFactura,
      montoEfectivo: Number(montoEfectivo),
      montoTarjeta: montoTarjetaCálculo,
      cardData,
    });
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        Resumen del Pago
      </h3>

      <div className="space-y-1 text-sm">
        {/* Sección Habitaciones */}
        {tieneHabitaciones && (
          <>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Habitaciones</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(breakdown.subtotalHabitaciones)}
              </span>
            </div>

            {breakdown.ajusteTemporadaHabs !== 0 && (
              <div className={`flex justify-between pl-3 text-xs ${
                breakdown.ajusteTemporadaHabs < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                <span>
                  {breakdown.ajusteTemporadaHabs < 0 ? 'Temporada baja' : 'Temporada alta'}
                </span>
                <span className="font-medium">
                  {breakdown.ajusteTemporadaHabs < 0
                    ? `-${formatCurrency(Math.abs(breakdown.ajusteTemporadaHabs))}`
                    : `+${formatCurrency(breakdown.ajusteTemporadaHabs)}`}
                </span>
              </div>
            )}

            {breakdown.descuentoCantidad > 0 && (
              <div className="flex justify-between pl-3 text-xs text-blue-600 dark:text-blue-400">
                <span>Desc. por cantidad</span>
                <span className="font-medium">-{formatCurrency(breakdown.descuentoCantidad)}</span>
              </div>
            )}
          </>
        )}

        {/* Sección Paquetes */}
        {tienePaquetes && (
          <>
            {tieneHabitaciones && (
              <div className="my-2 border-t border-dashed border-gray-200 dark:border-gray-700" />
            )}

            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Paquetes</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(breakdown.subtotalPaquetes)}
              </span>
            </div>

            {breakdown.descuentoPaquetes > 0 && (
              <div className="flex justify-between pl-3 text-xs text-green-600 dark:text-green-400">
                <span>Desc. paquete</span>
                <span className="font-medium">-{formatCurrency(breakdown.descuentoPaquetes)}</span>
              </div>
            )}

            {breakdown.ajusteTemporadaPaquetes !== 0 && (
              <div className={`flex justify-between pl-3 text-xs ${
                breakdown.ajusteTemporadaPaquetes < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                <span>
                  {breakdown.ajusteTemporadaPaquetes < 0 ? 'Temporada baja' : 'Temporada alta'}
                </span>
                <span className="font-medium">
                  {breakdown.ajusteTemporadaPaquetes < 0
                    ? `-${formatCurrency(Math.abs(breakdown.ajusteTemporadaPaquetes))}`
                    : `+${formatCurrency(breakdown.ajusteTemporadaPaquetes)}`}
                </span>
              </div>
            )}
          </>
        )}

        {/* Total */}
        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              Total a cobrar
            </span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(totalFinal)}
            </span>
          </div>
        </div>
      </div>

      {/* Método de pago y factura */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <MetodoPago
          baseTotal={totalFinal}
          clientPoints={Number(client?.puntos ?? 0)}
          metodoPago={metodoPago}
          onChangeMetodo={setMetodoPago}
          montoEfectivo={montoEfectivo}
          onChangeMontoEfectivo={setMontoEfectivo}
          montoTarjeta={montoTarjetaCálculo}
          onChangeCardData={setCardData}
        />
        <FacturaSelector value={tipoFactura} onChange={setTipoFactura} />
      </div>

      {/* Botón de confirmar */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handlePagar}
          disabled={!canConfirm}
          className={`flex w-full items-center justify-center rounded-lg px-4 py-3 font-semibold text-white transition-colors ${canConfirm
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-400'
            }`}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Procesando...
            </span>
          ) : (
            'Finalizar Reserva y Pagar'
          )}
        </button>
      </div>
    </div>
  );
}

export default PaymentSummary;
