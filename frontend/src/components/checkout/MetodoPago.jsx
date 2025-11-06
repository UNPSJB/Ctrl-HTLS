import { useEffect, useMemo, useCallback } from 'react'; // 1. Se elimina useState
import { Check } from 'lucide-react';
import TarjetaForm from './TarjetaForm';
import { usePago } from '@context/PagoContext'; // 2. Importar el nuevo hook

function MetodoPago({
  // 3. Se eliminan las props de estado
  // paymentMethod, (eliminado)
  // setPaymentMethod, (eliminado)
  // onCardChange, (eliminado)
  className = '',
  baseTotal = 0,
  clientPoints = 0,
}) {
  // 4. Usar el contexto para obtener el estado y las funciones
  const { metodoPago, setMetodoPago, setCardData } = usePago();
  // Se elimina el estado local (paymentMethod, cardPayload)
  // Se elimina el handleCardChange local

  const puntoEnabled = useMemo(() => {
    const pts = Number(clientPoints || 0);
    const total = Number(baseTotal || 0);
    return pts >= total;
  }, [clientPoints, baseTotal]);

  useEffect(() => {
    if (metodoPago === 'punto' && !puntoEnabled) {
      setMetodoPago('cash');
    }
  }, [metodoPago, puntoEnabled, setMetodoPago]);

  const methods = useMemo(
    () => [
      { id: 'Efectivo', label: 'Efectivo', disabled: false },
      { id: 'Puntos', label: 'Puntos', disabled: !puntoEnabled },
      { id: 'Tarjeta', label: 'Tarjeta', disabled: false },
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
              if (!m.disabled) setMetodoPago(m.id);
            }}
            className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border p-3 transition-colors ${
              metodoPago === m.id
                ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-900'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50'
            } ${m.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              id={`pay-${m.id}`}
              type="radio"
              name="payment"
              value={m.id}
              checked={metodoPago === m.id}
              onChange={() => {
                if (!m.disabled) setMetodoPago(m.id);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              disabled={m.disabled}
            />
            <div className="flex flex-1 items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {m.label}
              </span>
            </div>

            {metodoPago === m.id && (
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

      {metodoPago === 'card' && (
        <div className="mt-4">
          <TarjetaForm onChange={setCardData} />
        </div>
      )}
    </fieldset>
  );
}

export default MetodoPago;
