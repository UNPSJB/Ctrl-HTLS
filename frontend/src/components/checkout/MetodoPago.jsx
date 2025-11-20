import { useEffect, useMemo } from 'react';
import TarjetaForm from './TarjetaForm';
import { usePago } from '@context/PagoContext';

function MetodoPago({ className = '', baseTotal = 0, clientPoints = 0 }) {
  const { metodoPago, setMetodoPago, setCardData } = usePago();

  const puntoEnabled = useMemo(() => {
    const pts = Number(clientPoints || 0);
    const total = Number(baseTotal || 0);
    return pts >= total;
  }, [clientPoints, baseTotal]);

  useEffect(() => {
    if (metodoPago === 'Puntos' && !puntoEnabled) {
      setMetodoPago('Efectivo');
    }
  }, [metodoPago, puntoEnabled, setMetodoPago]);

  const methods = useMemo(
    () => [
      { id: 'Efectivo', label: 'Efectivo', disabled: false },
      { id: 'Puntos', label: 'Puntos', disabled: !puntoEnabled },
      { id: 'Tarjeta', label: 'Tarjeta', disabled: false },
      { id: 'Mixto', label: 'Mixto (Efectivo y Tarjeta)', disabled: false },
    ],
    [puntoEnabled]
  );

  // 2. Actualizamos la lógica para mostrar el formulario de tarjeta
  const showCardForm = metodoPago === 'Tarjeta' || metodoPago === 'Mixto';

  // Clases comunes para el select
  const selectClasses =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 appearance-none';

  return (
    <fieldset className={`mt-3 ${className}`} aria-label="Método de pago">
      <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Método de Pago
      </legend>

      <div className="relative">
        <select
          id="metodo-pago-select"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          className={selectClasses}
        >
          {methods.map((m) => (
            <option key={m.id} value={m.id} disabled={m.disabled}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.69 3.63c-.533.48-1.408.48-1.94 0l-3.69-3.63c-.408-.418-.436-1.17 0-1.615z" />
          </svg>
        </div>
      </div>

      {!puntoEnabled && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          La opción <strong>Puntos</strong> requiere {baseTotal} puntos.
          (Disponibles: {clientPoints})
        </p>
      )}

      {showCardForm && (
        <div className="mt-4">
          <TarjetaForm onChange={setCardData} />
        </div>
      )}
    </fieldset>
  );
}

export default MetodoPago;
