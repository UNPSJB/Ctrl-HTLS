import { useState, useEffect, useMemo } from 'react';
import { Check, CreditCard } from 'lucide-react';
import TarjetaForm from '@components/forms/TarjetaForm';

export default function MetodoPago({
  onChange,
  onCardChange,
  value,
  className = '',
}) {
  const [paymentMethod, setPaymentMethod] = useState(value ?? 'cash');

  // sync si vienen props controladas
  useEffect(() => {
    if (value !== undefined && value !== paymentMethod) {
      setPaymentMethod(value);
    }
  }, [value]);

  // notificar cambio de método
  useEffect(() => {
    if (typeof onChange === 'function') onChange(paymentMethod);
  }, [paymentMethod, onChange]);

  const methods = useMemo(
    () => [
      { id: 'cash', label: 'Efectivo', icon: null },
      { id: 'transfer', label: 'Transferencia', icon: null },
      { id: 'card', label: 'Tarjeta', icon: CreditCard },
    ],
    []
  );

  return (
    <fieldset className={`mt-3 ${className}`} aria-label="Método de pago">
      <legend className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Método
      </legend>

      <div className="space-y-2" role="radiogroup" aria-label="Métodos de pago">
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors select-none ${
              paymentMethod === m.id
                ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            <input
              id={`pay-${m.id}`}
              type="radio"
              name="payment"
              value={m.id}
              checked={paymentMethod === m.id}
              onChange={() => setPaymentMethod(m.id)}
              className="w-4 h-4"
              aria-checked={paymentMethod === m.id}
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

      {/* TarjetaForm se renderiza SOLO si el método seleccionado es 'card' */}
      {paymentMethod === 'card' && (
        <div className="mt-3">
          <TarjetaForm onChange={onCardChange} />
        </div>
      )}
    </fieldset>
  );
}
