import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import {
  calcularTotalCarrito,
  calcularTotalHotel,
  calcularNoches,
} from '@utils/pricingUtils';
import PriceTag from '@components/PriceTag';
import ResumenPago from '@components/ResumenPago';

/**
 * PagoPage (actualizada para usar ResumenPago)
 */

function convertPointsToAmount(points = 0) {
  const blocks = Math.floor(Number(points || 0) / 1000);
  return blocks * 10;
}

export default function PagoPage() {
  const navigate = useNavigate();
  const { carrito } = useCarrito();
  const { client } = useCliente();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cash' | 'transfer'
  const [usePoints, setUsePoints] = useState(false);

  // Campos de tarjeta
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  // Totales por hotel (usando pricingUtils)
  const hotelsData = useMemo(() => {
    return (carrito.hoteles || []).map((h) => ({
      id: h.idHotel ?? h.id ?? null,
      nombre: h.nombre ?? 'Hotel',
      habitaciones: h.habitaciones ?? [],
      paquetes: h.paquetes ?? [],
      temporada: h.temporada,
      coeficiente: h.coeficiente ?? 0,
      totals: calcularTotalHotel(h),
    }));
  }, [carrito.hoteles]);

  // Totales generales del carrito
  const cartTotals = useMemo(
    () => calcularTotalCarrito(carrito.hoteles || []),
    [carrito.hoteles]
  );

  const subtotal = Number(cartTotals.original ?? 0);
  const totalDiscounts = Number(cartTotals.descuento ?? 0);
  const baseTotal = Number(cartTotals.final ?? subtotal - totalDiscounts ?? 0);

  // Punto cliente
  const clientPoints = client?.puntos ?? 0;
  const maxPointsAmount = convertPointsToAmount(clientPoints);

  // descuento por puntos
  const pointsDiscount = usePoints ? Math.min(maxPointsAmount, baseTotal) : 0;
  const finalTotal = Math.max(
    0,
    Math.round((baseTotal - pointsDiscount) * 100) / 100
  );

  // helper noches
  const calcNights = (start, end) => calcularNoches(start, end);

  // validación simple de tarjeta
  const isCardValid = () => {
    if (paymentMethod !== 'card') return true;
    const num = String(cardData.number || '').replace(/\s+/g, '');
    const name = String(cardData.name || '').trim();
    const expiry = String(cardData.expiry || '').trim();
    const cvc = String(cardData.cvc || '').trim();
    if (num.length < 12) return false;
    if (name.length < 2) return false;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    if (!/^\d{3,4}$/.test(cvc)) return false;
    return true;
  };

  // confirmar (simulado)
  const handleConfirm = () => {
    if (!client) {
      alert('Seleccioná un cliente antes de confirmar la reserva.');
      return;
    }
    if (!carrito.hoteles.length) {
      alert('El carrito está vacío.');
      return;
    }
    if (!isCardValid()) {
      alert('Datos de tarjeta incompletos o inválidos.');
      return;
    }

    alert(
      `Reserva confirmada (simulado). Total pagado: $${finalTotal.toFixed(2)}`
    );
    navigate('/reserva/confirmacion');
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Confirmar Reserva
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Revisa los detalles antes de confirmar el pago
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column: detalles de reserva (sin cambios) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {client?.nombre ?? 'Cliente no seleccionado'}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div>DNI: {client?.documento ?? '-'}</div>
                    <div>Email: {client?.email ?? '-'}</div>
                    <div>Teléfono: {client?.telefono ?? '-'}</div>
                  </div>
                </div>

                {/* Bloque puntos */}
                <div className="ml-6 text-center">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg w-36">
                    <p className="text-2xl font-bold">{clientPoints}</p>
                    <p className="text-sm opacity-90">Puntos</p>
                    <p className="text-xs mt-1">≈ ${maxPointsAmount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hoteles / items */}
            <div className="space-y-6">
              {hotelsData.length === 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No hay items en el carrito.
                </div>
              )}

              {hotelsData.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {hotel.nombre}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {hotel.habitaciones.length} habitaciones —{' '}
                        {hotel.paquetes.length} paquetes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Original
                      </p>
                      <PriceTag
                        precio={hotel.totals.original}
                        coeficiente={1}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Final
                      </p>
                      <PriceTag precio={hotel.totals.final} coeficiente={1} />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Habitaciones */}
                    {hotel.habitaciones.map((hab) => {
                      const noches = calcNights(hab.fechaInicio, hab.fechaFin);
                      const cantidad = hab.qty ?? 1;
                      const totalRoom =
                        (hab.precio ?? hab.price ?? 0) * noches * cantidad;
                      return (
                        <div
                          key={`h-${hotel.id}-${hab.id}`}
                          className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-800"
                        >
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {hab.nombre}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Capacidad: {hab.capacidad} personas
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {hab.fechaInicio || '-'} — {hab.fechaFin || '-'}{' '}
                              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 rounded">
                                {noches} noche{noches > 1 ? 's' : ''}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <PriceTag
                              precio={Math.round(totalRoom * 100) / 100}
                              coeficiente={hotel.coeficiente}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Paquetes */}
                    {hotel.paquetes.length > 0 && (
                      <div className="pt-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Paquetes
                        </h4>
                        {hotel.paquetes.map((p) => {
                          const noches = calcNights(p.fechaInicio, p.fechaFin);
                          const priceBase =
                            (p.precioFinal ?? p.precio ?? 0) * (p.qty ?? 1);
                          return (
                            <div
                              key={`p-${hotel.id}-${p.id}`}
                              className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/10 rounded p-2"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                  {p.nombre}
                                </p>
                                {p.descripcion && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {p.descripcion}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {p.fechaInicio || '-'} — {p.fechaFin || '-'}{' '}
                                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-900 rounded">
                                    {noches} noches
                                  </span>
                                </p>
                              </div>
                              <div className="text-right">
                                <PriceTag
                                  precio={Math.round(priceBase * 100) / 100}
                                  coeficiente={hotel.coeficiente}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: USAMOS ResumenPago */}
          <ResumenPago
            subtotal={subtotal}
            totalDiscounts={totalDiscounts}
            baseTotal={baseTotal}
            clientPoints={clientPoints}
            maxPointsAmount={maxPointsAmount}
            usePoints={usePoints}
            setUsePoints={setUsePoints}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            pointsDiscount={pointsDiscount}
            finalTotal={finalTotal}
            handleConfirm={handleConfirm}
            cardData={cardData}
            setCardData={setCardData}
          />
        </div>
      </div>
    </div>
  );
}
