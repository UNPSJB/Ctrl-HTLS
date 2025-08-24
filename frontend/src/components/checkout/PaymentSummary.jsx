import { useMemo, useState, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcularTotalCarrito } from '@utils/pricingUtils';
import PuntosToggle from './PuntosToggle';
import MetodoPago from './MetodoPago';

function convertPointsToAmount(points = 0) {
  const blocks = Math.floor(Number(points || 0) / 1000);
  return blocks * 10;
}

function PaymentSummary() {
  const { carrito } = useCarrito();
  const { client } = useCliente();

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [usePoints, setUsePoints] = useState(false);

  const [cardPayload, setCardPayload] = useState({
    cardData: null,
    valid: false,
  });

  const [confirmed, setConfirmed] = useState(false);

  const handleCardChange = useCallback(({ cardData, valid }) => {
    setCardPayload({ cardData, valid });
  }, []);

  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito?.hoteles ?? []),
    [carrito?.hoteles]
  );

  const subtotal = Number(cartTotals?.original ?? 0);
  const totalDiscounts = Number(cartTotals?.descuento ?? 0);

  const baseTotal = Number(
    typeof cartTotals?.final === 'number'
      ? cartTotals.final
      : subtotal - totalDiscounts
  );

  const clientPoints = Number(client?.puntos ?? 0);
  const maxPointsAmount = useMemo(
    () => convertPointsToAmount(clientPoints),
    [clientPoints]
  );

  const pointsDiscount = useMemo(
    () => (usePoints ? Math.min(maxPointsAmount, baseTotal) : 0),
    [usePoints, maxPointsAmount, baseTotal]
  );

  const finalTotal = useMemo(
    () => Math.max(0, Math.round((baseTotal - pointsDiscount) * 100) / 100),
    [baseTotal, pointsDiscount]
  );

  const requiresCard = paymentMethod === 'card';
  const canConfirm =
    (!requiresCard || (requiresCard && cardPayload.valid)) &&
    carrito?.hoteles?.length > 0;

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    setConfirmed(true);
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
