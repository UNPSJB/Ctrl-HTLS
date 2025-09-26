import { useMemo, useState, useCallback, useEffect } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcularTotalCarrito } from '@utils/pricingUtils';
import MetodoPago from './MetodoPago';

function PaymentSummary() {
  // Context del carrito (hoteles y selección)
  const { carrito } = useCarrito();
  // Context del cliente para obtener puntos
  const { client } = useCliente();

  // Método de pago seleccionado (controlado localmente y pasado a MetodoPago)
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Payload de la tarjeta (validación desde TarjetaForm)
  const [cardPayload, setCardPayload] = useState({
    cardData: null,
    valid: false,
  });

  // Estado visual de confirmación
  const [confirmed, setConfirmed] = useState(false);

  // Handler para recibir cambios desde TarjetaForm
  const handleCardChange = useCallback(({ cardData, valid }) => {
    setCardPayload({ cardData, valid });
  }, []);

  // Totales calculados a partir del carrito
  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito?.hoteles ?? []),
    [carrito?.hoteles]
  );

  const subtotal = Number(cartTotals?.original ?? 0);
  const totalDiscounts = Number(cartTotals?.descuento ?? 0);

  // baseTotal es el total antes de cualquier forma de pago especial
  const baseTotal = useMemo(
    () =>
      Number(
        typeof cartTotals?.final === 'number'
          ? cartTotals.final
          : subtotal - totalDiscounts
      ),
    [cartTotals?.final, subtotal, totalDiscounts]
  );

  // Puntos del cliente (número)
  const clientPoints = useMemo(
    () => Number(client?.puntos ?? 0),
    [client?.puntos]
  );

  // Si el cliente tiene suficientes puntos para cubrir el total
  const clientePuedePagarConPuntos = useMemo(
    () => clientPoints >= baseTotal,
    [clientPoints, baseTotal]
  );

  // Si el método seleccionado es tarjeta
  const requiresCard = paymentMethod === 'card';

  // Si el método seleccionado es 'punto' y el cliente no tiene suficientes puntos,
  // evitar confirmar / procesar (además MetodoPago ya deshabiliza la opción).
  const requiresPuntoValid =
    paymentMethod === 'punto' ? clientePuedePagarConPuntos : true;

  // Condición para poder confirmar:
  // - Si se requiere tarjeta, que la tarjeta sea válida.
  // - Si se requiere punto, que el cliente tenga suficientes puntos.
  // - Que haya al menos un hotel en el carrito.
  const canConfirm =
    (!requiresCard || (requiresCard && cardPayload.valid)) &&
    requiresPuntoValid &&
    carrito?.hoteles?.length > 0;

  // Si llega un cambio externo del método (p. ej. controlado por padre), sincronizar.
  // (En este componente no esperamos prop 'value' controlado, así que esto es solo guardia.)
  useEffect(() => {
    // Si el método actual es 'punto' pero el cliente ya no puede pagar con puntos,
    // forzamos fallback a 'cash' para evitar inconsistencias.
    if (paymentMethod === 'punto' && !clientePuedePagarConPuntos) {
      setPaymentMethod('cash');
    }
  }, [paymentMethod, clientePuedePagarConPuntos]);

  // Si el método es 'punto' y el cliente puede usarlo, el total final será 0 (pago con puntos).
  // En cualquier otro caso, el total final es el baseTotal (redondeado a 2 decimales).
  const finalTotal = useMemo(() => {
    if (paymentMethod === 'punto' && clientePuedePagarConPuntos) {
      return 0;
    }
    return Math.max(0, Math.round(baseTotal * 100) / 100);
  }, [paymentMethod, clientePuedePagarConPuntos, baseTotal]);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;
    // Aquí solo marcamos confirmación visual; el flujo real de "reserva" / petición al backend
    // debería implementarse en el handler padre o en una función adicional.
    setConfirmed(true);
  }, [canConfirm]);

  return (
    <aside
      className="shadow-card sticky top-28 h-fit rounded-lg bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      aria-labelledby="payment-summary-title"
      role="complementary"
    >
      <div>
        <h3 id="payment-summary-title" className="mb-3 text-lg font-semibold">
          Resumen de Pago
        </h3>

        <div className="space-y-3 text-sm">
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

          <div className="border-t border-gray-100 pt-2 dark:border-gray-800" />

          <div className="flex justify-between">
            <span className="font-medium">Total antes de pago</span>
            <span className="font-bold">${baseTotal.toFixed(2)}</span>
          </div>

          <MetodoPago
            value={paymentMethod}
            onChange={setPaymentMethod}
            onCardChange={handleCardChange}
            clientPoints={clientPoints}
            totalAmount={baseTotal}
          />

          {/* Mostrar resumen específico si se usa 'punto' */}
          {paymentMethod === 'punto' && clientePuedePagarConPuntos && (
            <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-800">
              Pago con <strong>puntos</strong> seleccionado. Se utilizarán los
              puntos del cliente para cubrir el total de ${baseTotal.toFixed(2)}
              .
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
              className="mt-3 rounded bg-green-50 p-3 text-green-800"
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
              className={`w-full rounded-lg px-4 py-3 font-semibold text-white ${
                canConfirm
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-400'
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
