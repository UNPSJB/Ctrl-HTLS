import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { calcularTotalCarrito, calcularTotalHotel } from '@utils/pricingUtils';
import PriceTag from '@components/PriceTag';
import api from '@api/axiosInstance';

// Helper: convierte puntos en monto (1000 pts => $10)
function convertPointsToAmount(points = 0) {
  const blocks = Math.floor((Number(points) || 0) / 1000);
  return blocks * 10;
}

function PagoPage() {
  const navigate = useNavigate();
  const { carrito } = useCarrito();
  const { client, selectClient, clearClient } = useCliente();

  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card'
  const [usePoints, setUsePoints] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Totales por hotel y total carrito
  const hotelsTotals = useMemo(() => {
    return (carrito.hoteles || []).map((h) => ({
      idHotel: h.idHotel ?? h.id ?? null,
      nombre: h.nombre ?? h.hotelName ?? 'Hotel',
      totals: calcularTotalHotel(h),
      habitaciones: h.habitaciones ?? [],
      paquetes: h.paquetes ?? [],
    }));
  }, [carrito.hoteles]);

  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito.hoteles || []),
    [carrito.hoteles]
  );

  const clientPoints = client?.puntos ?? 0;
  const maxPointsAmount = convertPointsToAmount(clientPoints);

  const totalAfterPoints = useMemo(() => {
    const base = Number(cartTotals.final ?? 0);
    const discount = usePoints ? Math.min(maxPointsAmount, base) : 0;
    const final = Math.max(0, Math.round((base - discount) * 100) / 100);
    return { base, discount, final };
  }, [cartTotals.final, usePoints, maxPointsAmount]);

  const remainingPointsAfterUse = useMemo(() => {
    if (!usePoints) return clientPoints;
    const usedBlocks = Math.floor((totalAfterPoints.discount || 0) / 10);
    const pointsUsed = usedBlocks * 1000;
    return Math.max(0, clientPoints - pointsUsed);
  }, [usePoints, clientPoints, totalAfterPoints.discount]);

  const isCardValid = () => {
    if (paymentMethod !== 'card') return true;
    const num = String(cardData.number || '').replace(/\s+/g, '');
    const name = String(cardData.name || '').trim();
    const expiry = String(cardData.expiry || '').trim();
    const cvc = String(cardData.cvc || '').trim();
    if (!/^\d{15,19}$/.test(num)) return false;
    if (name.length < 3) return false;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    if (!/^\d{3,4}$/.test(cvc)) return false;
    return true;
  };

  const handleConfirmPayment = async () => {
    setMessage(null);

    if (!carrito.hoteles.length) {
      setMessage({ type: 'error', text: 'El carrito está vacío.' });
      return;
    }
    if (!client) {
      setMessage({
        type: 'error',
        text: 'Seleccioná o buscá un cliente antes de pagar.',
      });
      return;
    }
    if (paymentMethod === 'card' && !isCardValid()) {
      setMessage({ type: 'error', text: 'Datos de tarjeta inválidos.' });
      return;
    }

    setLoading(true);

    const payload = {
      clientId: client.id,
      hotels: carrito.hoteles,
      totals: {
        base: totalAfterPoints.base,
        discountPoints: totalAfterPoints.discount,
        final: totalAfterPoints.final,
      },
      payment: {
        method: paymentMethod,
        card:
          paymentMethod === 'card'
            ? { last4: (cardData.number || '').slice(-4) }
            : null,
      },
    };

    try {
      const resp = await api.post('/reservas', payload);
      setMessage({
        type: 'success',
        text: 'Pago procesado. Reserva creada correctamente.',
      });
      navigate('/reserva/confirmacion');
    } catch (err) {
      console.warn(
        'Error al comunicar con backend (simulando):',
        err?.message || err
      );
      setMessage({
        type: 'info',
        text:
          'No se pudo contactar el backend (modo demo). Se simuló la reserva localmente. ' +
          'Implementá endpoint /reservas para procesamiento real.',
      });
      setTimeout(() => navigate('/reserva/confirmacion'), 900);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Pago y Confirmación de Reserva
      </h1>

      {/* Cliente */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Cliente
        </h2>
        {client ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {client.nombre}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {client.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Puntos: {client.puntos}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={() => selectClient(null)}
              >
                Cambiar Cliente
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => {
                  clearClient();
                }}
              >
                Quitar Cliente
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No hay cliente seleccionado. Volvé a la página de reserva para
            seleccionar uno.
          </div>
        )}
      </section>

      {/* Resumen por hoteles */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Resumen de Reserva
        </h2>

        <div className="space-y-4">
          {hotelsTotals.length === 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              No hay items en el carrito.
            </div>
          )}

          {hotelsTotals.map((h) => (
            <div
              key={h.idHotel}
              className="border rounded p-3 bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {h.nombre}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Habitaciones: {h.habitaciones.length} — Paquetes:{' '}
                    {h.paquetes.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Original
                  </p>
                  <PriceTag precio={h.totals.original} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Final
                  </p>
                  <PriceTag precio={h.totals.final} />
                </div>
              </div>

              {/* Listado simplificado de items */}
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {h.habitaciones.map((hab) => (
                  <div
                    key={`h-${h.idHotel}-${hab.id}`}
                    className="flex justify-between"
                  >
                    <span>
                      {hab.nombre} (x{hab.qty ?? 1})
                    </span>
                    <span>${(hab.precio ?? hab.price ?? 0).toFixed(2)}</span>
                  </div>
                ))}

                {h.paquetes.map((p) => (
                  <div
                    key={`p-${h.idHotel}-${p.id}`}
                    className="flex justify-between mt-1"
                  >
                    <span>
                      {p.nombre} (noches: {p.noches ?? '-'})
                    </span>
                    <span>
                      $
                      {(
                        (h.totals.original &&
                          h.totals.original /
                            Math.max(
                              1,
                              (h.paquetes || []).length +
                                (h.habitaciones || []).length
                            )) ||
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totales y puntos */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              ${cartTotals.final?.toFixed(2) ?? '0.00'}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Puntos disponibles
            </p>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {clientPoints}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Equivalen a ${maxPointsAmount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={usePoints}
              onChange={() => setUsePoints((s) => !s)}
              className="w-4 h-4"
              disabled={!client || clientPoints < 1000}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Usar puntos
            </span>
          </label>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Descuento por puntos: ${totalAfterPoints.discount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Puntos restantes (si aplica): {remainingPointsAfterUse}
            </p>
          </div>
        </div>
      </section>

      {/* Metodo de pago */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Método de pago
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
              className="w-4 h-4"
            />
            <span className="text-sm">Efectivo</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              className="w-4 h-4"
            />
            <span className="text-sm">Tarjeta</span>
            <CreditCard className="w-4 h-4 ml-1" />
          </label>
        </div>

        {paymentMethod === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Número de tarjeta"
              value={cardData.number}
              onChange={(e) =>
                setCardData((p) => ({ ...p, number: e.target.value }))
              }
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <input
              type="text"
              placeholder="Nombre en la tarjeta"
              value={cardData.name}
              onChange={(e) =>
                setCardData((p) => ({ ...p, name: e.target.value }))
              }
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <input
              type="text"
              placeholder="MM/YY"
              value={cardData.expiry}
              onChange={(e) =>
                setCardData((p) => ({ ...p, expiry: e.target.value }))
              }
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <input
              type="text"
              placeholder="CVC"
              value={cardData.cvc}
              onChange={(e) =>
                setCardData((p) => ({ ...p, cvc: e.target.value }))
              }
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
        )}
      </section>

      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleConfirmPayment}
          disabled={loading}
        >
          {loading
            ? 'Procesando...'
            : `Pagar $${totalAfterPoints.final.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

export default PagoPage;
