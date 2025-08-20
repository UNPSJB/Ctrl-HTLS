import { useState, useMemo } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcularTotalCarrito } from '@utils/pricingUtils';

function convertPointsToAmount(points = 0) {
  const blocks = Math.floor(Number(points || 0) / 1000);
  return blocks * 10;
}

export default function ResumenPago() {
  const navigate = useNavigate();
  const { carrito } = useCarrito();
  const { client } = useCliente();

  // estado local de pago
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card'|'cash'|'transfer'
  const [usePoints, setUsePoints] = useState(false);

  // campos tarjeta (si aplica)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  // Totales globales calculados desde el carrito (pricingUtils)
  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito.hoteles ?? []),
    [carrito.hoteles]
  );

  const subtotal = Number(cartTotals.original ?? 0);
  const totalDiscounts = Number(cartTotals.descuento ?? 0);
  const baseTotal = Number(cartTotals.final ?? subtotal - totalDiscounts ?? 0);

  // Puntos del cliente (desde contexto)
  const clientPoints = client?.puntos ?? 0;
  const maxPointsAmount = useMemo(
    () => convertPointsToAmount(clientPoints),
    [clientPoints]
  );

  // descuento por puntos si se aplican
  const pointsDiscount = useMemo(
    () => (usePoints ? Math.min(maxPointsAmount, baseTotal) : 0),
    [usePoints, maxPointsAmount, baseTotal]
  );

  const finalTotal = Math.max(
    0,
    Math.round((baseTotal - pointsDiscount) * 100) / 100
  );

  // validación simple de tarjeta
  const validateCard = (card) => {
    if (paymentMethod !== 'card') return true;
    const num = String(card.number || '').replace(/\s+/g, '');
    const name = String(card.name || '').trim();
    const expiry = String(card.expiry || '').trim();
    const cvc = String(card.cvc || '').trim();
    if (num.length < 12) return false;
    if (name.length < 2) return false;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    if (!/^\d{3,4}$/.test(cvc)) return false;
    return true;
  };

  // confirmar (simulado). Aquí integrarás el backend (axios) cuando corresponda.
  const handleConfirm = () => {
    if (!client) {
      alert('Seleccioná un cliente antes de confirmar el pago.');
      return;
    }
    if (!carrito.hoteles || carrito.hoteles.length === 0) {
      alert('No hay reservas en el carrito.');
      return;
    }
    if (!validateCard(cardData)) {
      alert('Datos de tarjeta incompletos o inválidos.');
      return;
    }

    // Simulación: llamar a backend / procesar pago / bloquear reservas
    alert(
      `Pago simulado: Total pagado $${finalTotal.toFixed(2)}. Reserva confirmada.`
    );
    navigate('/reserva/confirmacion');
  };

  return (
    <aside className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 sticky top-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
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

          {/* Puntos (se obtienen desde contexto dentro del componente) */}
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                Usar Puntos
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="text-yellow-700 dark:text-yellow-300 text-sm">
              <div>Disponibles: {clientPoints} puntos</div>
              <div>Equivalen a: ${maxPointsAmount}</div>
              {usePoints && (
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  Aplicando: -${pointsDiscount.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />

          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Final
            </div>
            <div className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
              ${finalTotal.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Método
            </div>

            {/* Opciones estilo "card" / radio-like */}
            <div className="mt-2 space-y-2">
              {[
                { id: 'card', label: 'Tarjeta', icon: CreditCard },
                { id: 'cash', label: 'Efectivo', icon: null },
                { id: 'transfer', label: 'Transferencia', icon: null },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === m.id
                      ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {m.icon && (
                      <m.icon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    )}
                    <span className="text-sm">{m.label}</span>
                  </div>
                  {paymentMethod === m.id && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </label>
              ))}
            </div>

            {/* Campos de tarjeta (solo si se seleccionó tarjeta) */}
            {paymentMethod === 'card' && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Número de tarjeta"
                  value={cardData.number}
                  onChange={(e) =>
                    setCardData((p) => ({ ...p, number: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
                />
                <input
                  type="text"
                  placeholder="Nombre en la tarjeta"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(e) =>
                      setCardData((p) => ({ ...p, expiry: e.target.value }))
                    }
                    className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    value={cardData.cvc}
                    onChange={(e) =>
                      setCardData((p) => ({ ...p, cvc: e.target.value }))
                    }
                    className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold"
          >
            Confirmar Reserva
          </button>
        </div>
      </div>
    </aside>
  );
}
