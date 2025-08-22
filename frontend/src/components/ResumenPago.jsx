import { useMemo, useState, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcularTotalCarrito } from '@utils/pricingUtils';
import PuntosToggle from '@components/ui/PuntosToggle';
import MetodoPago from '@components/ui/MetodoPago';

function convertPointsToAmount(points = 0) {
  const blocks = Math.floor(Number(points || 0) / 1000);
  return blocks * 10;
}

export default function ResumenPago() {
  // contexts
  const { carrito } = useCarrito();
  const { client } = useCliente();

  // estado local: método de pago controlado por el padre
  const [paymentMethod, setPaymentMethod] = useState('cash'); // inicia en 'cash' por pedido

  // usamos este flag para saber si el usuario activó usar puntos (PuntosToggle notificará)
  const [usePoints, setUsePoints] = useState(false);

  // recibimos aquí los datos/validez del formulario de tarjeta (MetodoPago -> TarjetaForm -> onCardChange)
  const [setCardPayload] = useState({
    cardData: null,
    valid: false,
  });

  const handleCardChange = useCallback(({ cardData, valid }) => {
    setCardPayload({ cardData, valid });
  }, []);

  // Totales desde carrito
  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito?.hoteles ?? []),
    [carrito?.hoteles]
  );

  const subtotal = Number(cartTotals?.original ?? 0);
  const totalDiscounts = Number(cartTotals?.descuento ?? 0);
  const baseTotal = Number(cartTotals?.final ?? subtotal - totalDiscounts ?? 0);

  // puntos cliente (se puede usar también en PuntosToggle)
  const clientPoints = Number(client?.puntos ?? 0);
  const maxPointsAmount = useMemo(
    () => convertPointsToAmount(clientPoints),
    [clientPoints]
  );

  // descuento por puntos aplicado si el usuario los activó
  const pointsDiscount = useMemo(
    () => (usePoints ? Math.min(maxPointsAmount, baseTotal) : 0),
    [usePoints, maxPointsAmount, baseTotal]
  );

  const finalTotal = useMemo(
    () => Math.max(0, Math.round((baseTotal - pointsDiscount) * 100) / 100),
    [baseTotal, pointsDiscount]
  );

  return (
    <aside className="space-y-6 max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
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

          {/* PuntosToggle maneja su UI internamente pero le pedimos que notifique al padre */}
          <PuntosToggle onToggle={setUsePoints} />

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />

          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Final
            </div>
            <div className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
              ${finalTotal.toFixed(2)}
            </div>
          </div>

          {/* MetodoPago internamente renderiza TarjetaForm cuando corresponde.
              Le pasamos value y onChange para mantener control desde aquí,
              y onCardChange para recibir cardData/valid cuando el form cambia. */}
          <MetodoPago
            value={paymentMethod}
            onChange={setPaymentMethod}
            onCardChange={handleCardChange}
          />

          <div className="mt-4">
            <button
              type="button"
              className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
            >
              Confirmar Reserva
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
