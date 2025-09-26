import { useState, useEffect, useMemo } from 'react';
import { Check, CreditCard } from 'lucide-react';
import TarjetaForm from './TarjetaForm';

// Estructura: cada componente como función que retorna JSX y exportado por defecto.

function MetodoPago({
  onChange,
  onCardChange,
  value,
  className = '',
  // Nuevos props que permiten decidir si 'punto' está habilitado
  clientPoints = 0,
  totalAmount = 0,
}) {
  const [paymentMethod, setPaymentMethod] = useState(value ?? 'cash');

  // Sincronizar si vienen props controladas
  useEffect(() => {
    if (value !== undefined && value !== paymentMethod) {
      setPaymentMethod(value);
    }
  }, [value, paymentMethod]);

  // Notificar cambio de método
  useEffect(() => {
    if (typeof onChange === 'function') onChange(paymentMethod);
  }, [paymentMethod, onChange]);

  // Determinar si la opción "punto" debe estar habilitada
  const puntoEnabled = useMemo(() => {
    const pts = Number(clientPoints || 0);
    const total = Number(totalAmount || 0);
    return pts >= total;
  }, [clientPoints, totalAmount]);

  // Si el método actual es 'punto' pero ya no está permitido, forzamos fallback a 'cash'
  useEffect(() => {
    if (paymentMethod === 'punto' && !puntoEnabled) {
      setPaymentMethod('cash');
    }
  }, [paymentMethod, puntoEnabled]);

  const methods = useMemo(
    () => [
      { id: 'cash', label: 'Efectivo', icon: null, disabled: false },
      { id: 'punto', label: 'Punto', icon: null, disabled: !puntoEnabled },
      { id: 'card', label: 'Tarjeta', icon: CreditCard, disabled: false },
    ],
    [puntoEnabled]
  );

  return (
    <fieldset className={`mt-3 ${className}`} aria-label="Método de pago">
      <legend className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        Método
      </legend>

      <div className="space-y-2" role="radiogroup" aria-label="Métodos de pago">
        {methods.map((m) => (
          <label
            key={m.id}
            // Click en label sólo cambia si no está deshabilitado
            onClick={() => {
              if (!m.disabled) setPaymentMethod(m.id);
            }}
            className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border p-3 transition-colors ${
              paymentMethod === m.id
                ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
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
              className="h-4 w-4"
              aria-checked={paymentMethod === m.id}
              disabled={m.disabled}
              aria-disabled={m.disabled}
            />

            <div className="flex flex-1 items-center gap-2">
              {m.icon && (
                <m.icon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
              )}
              <span className="text-sm">{m.label}</span>
            </div>

            {paymentMethod === m.id && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </label>
        ))}
      </div>

      {/* Mensaje explicativo si 'punto' está deshabilitado */}
      {!puntoEnabled && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Opción <strong>Punto</strong> disponible sólo si el cliente tiene la
          misma o mayor cantidad de puntos que el total. (Puntos: {clientPoints}{' '}
          — Total: ${Number(totalAmount).toFixed(2)})
        </p>
      )}

      {/* TarjetaForm se renderiza SOLO si el método seleccionado es 'card' */}
      {paymentMethod === 'card' && (
        <div className="mt-3">
          <TarjetaForm onChange={onCardChange} />
        </div>
      )}
    </fieldset>
  );
}

export default MetodoPago;
