import { useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import TarjetaForm from './TarjetaForm';

function MetodoPago({
  paymentMethod,
  setPaymentMethod,
  onCardChange,
  className = '',
  baseTotal = 0,
  clientPoints = 0,
}) {
  const puntoEnabled = useMemo(() => {
    const pts = Number(clientPoints || 0);
    const total = Number(baseTotal || 0);
    return pts >= total;
  }, [clientPoints, baseTotal]);

  useEffect(() => {
    if (paymentMethod === 'punto' && !puntoEnabled) {
      setPaymentMethod('cash');
    }
  }, [paymentMethod, puntoEnabled, setPaymentMethod]);

  // --- Iconos eliminados del array de configuración ---
  const methods = useMemo(
    () => [
      { id: 'cash', label: 'Efectivo', disabled: false },
      { id: 'punto', label: 'Puntos', disabled: !puntoEnabled },
      { id: 'card', label: 'Tarjeta', disabled: false },
    ],
    [puntoEnabled]
  );

  return (
    <fieldset className={`mt-3 ${className}`} aria-label="Método de pago">
      <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Método de Pago
      </legend>

      <div className="space-y-2" role="radiogroup">
        {methods.map((m) => (
          <label
            key={m.id}
            onClick={() => {
              if (!m.disabled) setPaymentMethod(m.id);
            }}
            className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border p-3 transition-colors ${
              paymentMethod === m.id
                ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-900'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50'
            } ${m.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              id={`pay-${m.id}`}
              type="radio"
              name="payment"
              value={m.id}
              checked={paymentMethod === m.id}
              onChange={() => {
                if (!m.disabled) setPaymentMethod(m.id);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              disabled={m.disabled}
            />

            <div className="flex flex-1 items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {m.label}
              </span>
            </div>

            {paymentMethod === m.id && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </label>
        ))}
      </div>

      {!puntoEnabled && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          La opción <strong>Puntos</strong> requiere {baseTotal} puntos.
          (Disponibles: {clientPoints})
        </p>
      )}

      {paymentMethod === 'card' && (
        <div className="mt-4">
          <TarjetaForm onChange={onCardChange} />
        </div>
      )}
    </fieldset>
  );
}

export default MetodoPago;
