import { useMemo, useState, useCallback, useEffect } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
// Importamos solo lo necesario del utils
import { calcCartTotal } from '@utils/pricingUtils';
// Importamos el hook de preparación de datos que creamos
import { useCartSelections } from '@hooks/useCartSelections';
// Componente que maneja la selección de método de pago
import MetodoPago from './MetodoPago';

function PaymentSummary() {
  // Context del carrito (hoteles y selección)
  const { carrito } = useCarrito();
  // Context del cliente para obtener puntos
  const { client } = useCliente();

  // Método de pago seleccionado
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Payload de la tarjeta (validación desde TarjetaForm)
  const [cardPayload, setCardPayload] = useState({
    cardData: null,
    valid: false,
  });

  // Estado visual de confirmación (local)
  const [confirmed, setConfirmed] = useState(false);

  // Handler para recibir cambios desde TarjetaForm
  const handleCardChange = useCallback(({ cardData, valid }) => {
    setCardPayload({ cardData, valid });
  }, []);

  // 🔥 CAMBIO CLAVE 1: Usamos useCartSelections para limpiar la preparación de datos
  // Asumimos 0% de temporada aquí ya que la temporada ya está en el objeto hotel del carrito
  const selections = useCartSelections(
    carrito?.hoteles?.flatMap((h) => h.habitaciones || []) || [],
    carrito?.hoteles?.flatMap((h) => h.paquetes || []) || [],
    0, // Porcentaje de temporada (ya incluido en la estructura del carrito)
    false
  );

  // Cálculo de totales
  const { totals, baseTotal, finalTotal, descuento } = useMemo(() => {
    // Calculamos el total con la utilidad central
    const calculatedTotals = calcCartTotal(selections);

    // Obtenemos los puntos del cliente (si existen)
    const puntos = Number(client?.puntos ?? 0);

    // El 'baseTotal' es el total antes de aplicar puntos
    const baseT = Number(calculatedTotals.final ?? 0);

    // Aplicamos los puntos si el método de pago es 'points'
    const finalT = paymentMethod === 'points' && puntos >= baseT ? 0 : baseT;

    return {
      totals: calculatedTotals,
      baseTotal: baseT,
      finalTotal: finalT,
      descuento: calculatedTotals.descuento || 0,
    };
  }, [selections, client?.puntos, paymentMethod]);

  // Lógica para saber si se puede confirmar
  const canConfirm = useMemo(() => {
    // 1. Debe haber algo para pagar (o puntos para cubrirlo)
    if (baseTotal === 0 && finalTotal === 0) return false;

    // 2. Si es tarjeta, debe estar validada
    if (paymentMethod === 'card' && !cardPayload.valid) return false;

    // 3. Si es puntos, el cliente debe tener suficientes
    if (paymentMethod === 'points' && baseTotal > Number(client?.puntos ?? 0))
      return false;

    // Si no hay restricciones, se puede confirmar
    return true;
  }, [paymentMethod, cardPayload.valid, baseTotal, finalTotal, client?.puntos]);

  // Manejador de confirmación (simulación)
  const handleConfirm = useCallback(() => {
    // Aquí se ejecutaría la llamada con axios al backend
    // para finalizar la reserva, pasar el paymentMethod y el cardPayload
    console.log('Finalizando Reserva...');
    // axios.post('/api/reservas/confirmar', {
    //   selections: selections,
    //   cliente: client,
    //   paymentMethod: paymentMethod,
    //   cardData: cardPayload.cardData,
    //   finalAmount: finalTotal
    // }).then(() => setConfirmed(true));

    // Por ahora, solo simulación
    setConfirmed(true);
  }, [selections, client, paymentMethod, cardPayload.cardData, finalTotal]);

  useEffect(() => {
    // Resetear el estado de confirmación al cambiar el método de pago
    setConfirmed(false);
  }, [paymentMethod]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        Resumen del Pago
      </h3>

      {/* Detalle del Carrito (Resumen Rápido) */}
      {/* Esto podría ser otro componente (por ejemplo, CartDetailList) */}
      <div className="space-y-2 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">
            ${(baseTotal - descuento).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Descuento/Temporada:</span>
          <span
            className={`font-medium ${descuento > 0 ? 'text-green-600' : 'text-gray-500'}`}
          >
            ${descuento.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between pt-1 text-base font-semibold">
          <span>Total a Cubrir:</span>
          <span>${baseTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Selección del Método de Pago */}
      <div className="mt-4">
        <MetodoPago
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onCardChange={handleCardChange}
          // Pasamos el total y los puntos para el renderizado condicional
          baseTotal={baseTotal}
          clientPoints={Number(client?.puntos ?? 0)}
        />
      </div>

      {/* Resumen Final de Puntos/Pago */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
        {paymentMethod === 'points' && finalTotal === 0 && (
          <div
            role="alert"
            className="mb-3 rounded bg-blue-100 p-3 text-sm text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
          >
            Monto cubierto. Se utilizarán los puntos del cliente para cubrir el
            total de ${baseTotal.toFixed(2)}.
          </div>
        )}

        <div className="border-t border-gray-100 pt-2 dark:border-gray-800" />

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Final
          </div>
          <div className="text-2xl font-extrabold">
            ${finalTotal.toFixed(2)}
          </div>
        </div>

        {confirmed ? (
          <div
            role="status"
            className="mt-3 rounded bg-green-50 p-3 text-green-800 dark:bg-green-900/50 dark:text-green-200"
          >
            Reserva marcada como <strong>confirmada (visual)</strong>.
          </div>
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            aria-disabled={!canConfirm}
            className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
              canConfirm
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            {confirmed ? 'Reserva Confirmada' : 'Finalizar Reserva y Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummary;
