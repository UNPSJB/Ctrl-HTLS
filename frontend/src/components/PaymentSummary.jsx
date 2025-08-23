import { useMemo, useState, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcularTotalCarrito } from '@utils/pricingUtils';
import PuntosToggle from '@components/ui/PuntosToggle';
import MetodoPago from '@components/ui/MetodoPago';

/* Convierte puntos a monto (si lo necesitas en otros lados, mueve a utils) */
function convertPointsToAmount(points = 0) {
  const blocks = Math.floor(Number(points || 0) / 1000);
  return blocks * 10;
}

/* Componente visual: muestra resumen del pago y opción de método.
   NO realiza ninguna llamada a backend — solo UI y estados locales. */
function PaymentSummary() {
  // contexts: solo lectura visual
  const { carrito } = useCarrito();
  const { client } = useCliente();

  // estado local controlado por el componente (visual)
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card' | ...
  const [usePoints, setUsePoints] = useState(false);

  // payload del formulario de tarjeta (recibido desde MetodoPago -> TarjetaForm)
  // corregido: guardamos tanto value como setter
  const [cardPayload, setCardPayload] = useState({
    cardData: null,
    valid: false,
  });

  // estado visual al confirmar (no persiste ni hace network)
  const [confirmed, setConfirmed] = useState(false);

  const handleCardChange = useCallback(({ cardData, valid }) => {
    setCardPayload({ cardData, valid });
  }, []);

  // Totales calculados con la util existente
  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito?.hoteles ?? []),
    [carrito?.hoteles]
  );

  const subtotal = Number(cartTotals?.original ?? 0);
  const totalDiscounts = Number(cartTotals?.descuento ?? 0);

  // baseTotal: si el util ya devuelve final, se usa; si no se calcula
  const baseTotal = Number(
    typeof cartTotals?.final === 'number'
      ? cartTotals.final
      : subtotal - totalDiscounts
  );

  // puntos del cliente y máximo convertible a dinero
  const clientPoints = Number(client?.puntos ?? 0);
  const maxPointsAmount = useMemo(
    () => convertPointsToAmount(clientPoints),
    [clientPoints]
  );

  // descuento por puntos (solo visual)
  const pointsDiscount = useMemo(
    () => (usePoints ? Math.min(maxPointsAmount, baseTotal) : 0),
    [usePoints, maxPointsAmount, baseTotal]
  );

  const finalTotal = useMemo(
    () => Math.max(0, Math.round((baseTotal - pointsDiscount) * 100) / 100),
    [baseTotal, pointsDiscount]
  );

  // reglas visuales para habilitar el botón:
  // - si requiere tarjeta, que el form indique valid: true
  // - que haya al menos un hotel en el carrito
  const requiresCard = paymentMethod === 'card';
  const canConfirm =
    (!requiresCard || (requiresCard && cardPayload.valid)) &&
    carrito?.hoteles?.length > 0;

  // handler puramente visual: marca como confirmado localmente
  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    // Solo efecto visual: marcar confirmado (no enviar nada)
    setConfirmed(true);
    // Si quieres, aquí podrías abrir un modal local o limpiar estados visuales
  }, [canConfirm]);

  return (
    <aside
      className="space-y-6 max-w-md"
      aria-labelledby="payment-summary-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4">
        <h3
          id="payment-summary-title"
          className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100"
        >
          Resumen de Pago
        </h3>

        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Descuentos</span>
            <span className="font-medium text-green-600">
              -${totalDiscounts.toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />

          <div className="flex justify-between">
            <span className="font-medium">Total antes de puntos</span>
            <span className="font-bold">${baseTotal.toFixed(2)}</span>
          </div>

          {/* Toggle visual de puntos: le pasamos información para que muestre saldo */}
          <PuntosToggle
            onToggle={setUsePoints}
            clientPoints={clientPoints}
            maxPointsAmount={maxPointsAmount}
            disabled={clientPoints < 1000}
          />

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />

          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Final
            </div>
            <div className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
              ${finalTotal.toFixed(2)}
            </div>
          </div>

          {/* MetodoPago renderiza TarjetaForm si corresponde; solo comunica cambios al padre */}
          <MetodoPago
            value={paymentMethod}
            onChange={setPaymentMethod}
            onCardChange={handleCardChange}
          />

          {confirmed ? (
            <div
              role="status"
              className="mt-3 p-3 rounded bg-green-50 text-green-800"
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
              className={`w-full px-4 py-3 rounded-lg font-semibold text-white ${
                canConfirm
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {confirmed ? 'Reserva Confirmada' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default PaymentSummary;
