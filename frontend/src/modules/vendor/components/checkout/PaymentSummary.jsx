import { useState } from 'react';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';
import { usePagar } from '@vendor-hooks/usePagar';
import { useCliente } from '@vendor-context/ClienteContext';
import { formatCurrency } from '@utils/pricingUtils';
import PriceTag from '@ui/PriceTag';
import MetodoPago from './MetodoPago';
import FacturaSelector from './FacturaSelector';
import AppButton from '@/components/ui/AppButton';

// Resumen final de la transacción y procesamiento del pago
function PaymentSummary() {
  const { client } = useCliente();
  const {
    porHotel,
    totalFinal,
    globalTemporadaAlta,
    globalTemporadaBaja,
    globalDescuentoCantidad,
    globalDescuentoPaquetes
  } = useCarritoPrecios();
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

  const isPaymentValid = () => {
    if (metodoPago === 'Efectivo' || metodoPago === 'Puntos') return true;
    if (metodoPago === 'Tarjeta' || metodoPago === 'Mixto') {
      return cardData?.valid === true;
    }
    return false;
  };

  const isFormValid = canConfirm && isPaymentValid();

  return (
    <div className="rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        Resumen del Pago
      </h3>

      <div className="space-y-4 text-sm">
        {/* Sección Habitaciones */}
        {tieneHabitaciones && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal Habitaciones</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(breakdown.subtotalHabitaciones)}
              </span>
            </div>
            
            {breakdown.ajusteTemporadaHabs < 0 && (
              <div className="flex justify-between text-xs font-medium text-green-600 dark:text-green-400">
                <span>Descuento Temporada</span>
                <span>{formatCurrency(breakdown.ajusteTemporadaHabs)}</span>
              </div>
            )}
            {breakdown.ajusteTemporadaHabs > 0 && (
              <div className="flex justify-between text-xs font-medium text-red-600 dark:text-red-400">
                <span>Aumento Temporada</span>
                <span>+{formatCurrency(breakdown.ajusteTemporadaHabs)}</span>
              </div>
            )}
            {breakdown.descuentoCantidad > 0 && (
              <div className="flex justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                <span>Descuento por Cantidad</span>
                <span>-{formatCurrency(breakdown.descuentoCantidad)}</span>
              </div>
            )}
          </div>
        )}

        {/* Sección Paquetes */}
        {tienePaquetes && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal Paquetes</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(breakdown.subtotalPaquetes)}
              </span>
            </div>
            
            {breakdown.ajusteTemporadaPaquetes < 0 && (
              <div className="flex justify-between text-xs font-medium text-green-600 dark:text-green-400">
                <span>Descuento Temporada</span>
                <span>{formatCurrency(breakdown.ajusteTemporadaPaquetes)}</span>
              </div>
            )}
            {breakdown.ajusteTemporadaPaquetes > 0 && (
              <div className="flex justify-between text-xs font-medium text-red-600 dark:text-red-400">
                <span>Aumento Temporada</span>
                <span>+{formatCurrency(breakdown.ajusteTemporadaPaquetes)}</span>
              </div>
            )}
            {breakdown.descuentoPaquetes > 0 && (
              <div className="flex justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                <span>Descuento de Paquete</span>
                <span>-{formatCurrency(breakdown.descuentoPaquetes)}</span>
              </div>
            )}
          </div>
        )}

        {/* Total General */}
        <div className="mt-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              Total a cobrar
            </span>
            <PriceTag precio={totalFinal} />
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
        <AppButton
          fullWidth
          size="lg"
          loading={isProcessing}
          disabled={!isFormValid}
          onClick={handlePagar}
        >
          Finalizar Reserva y Pagar
        </AppButton>
      </div>
    </div>
  );
}

export default PaymentSummary;
