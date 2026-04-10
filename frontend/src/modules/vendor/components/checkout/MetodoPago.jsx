import { useEffect, useMemo } from 'react';
import { formatCurrency } from '@utils/pricingUtils';
import TarjetaForm from './TarjetaForm';

// Selector de métodos de pago (Efectivo, Puntos, Tarjeta, Mixto)
function MetodoPago({
  className = '',
  baseTotal = 0,
  clientPoints = 0,
  metodoPago,
  onChangeMetodo,
  montoEfectivo,
  onChangeMontoEfectivo,
  montoTarjeta,
  onChangeCardData,
}) {
  const puntoEnabled = useMemo(() => {
    const pts = Number(clientPoints || 0);
    const total = Number(baseTotal || 0);
    return pts >= total;
  }, [clientPoints, baseTotal]);

  useEffect(() => {
    if (metodoPago === 'Puntos' && !puntoEnabled) {
      onChangeMetodo('Efectivo');
    }
  }, [metodoPago, puntoEnabled, onChangeMetodo]);

  const methods = useMemo(
    () => [
      { id: 'Efectivo', label: 'Efectivo', disabled: false },
      { id: 'Puntos', label: 'Puntos', disabled: !puntoEnabled },
      { id: 'Tarjeta', label: 'Tarjeta', disabled: false },
      { id: 'Mixto', label: 'Mixto (Efectivo y Tarjeta)', disabled: false },
    ],
    [puntoEnabled]
  );

  const showCardForm = metodoPago === 'Tarjeta' || metodoPago === 'Mixto';

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
          onChange={(e) => onChangeMetodo(e.target.value)}
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

      {metodoPago === 'Mixto' && (
        <div className="mt-4 appearance-none rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
            Desglose Mixto
          </h4>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Monto en Efectivo</span>
              <div className="relative mt-1 flex items-center">
                <span className="absolute left-3 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  max={baseTotal}
                  step="0.01"
                  value={montoEfectivo || ''}
                  onChange={(e) => onChangeMontoEfectivo(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 bg-white py-2 pl-7 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="0.00"
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Monto restante a Tarjeta:</span>
              <span className={`font-semibold ${montoTarjeta < 0 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {formatCurrency(Math.max(0, montoTarjeta))}
              </span>
            </div>
            {montoTarjeta < 0 && (
              <p className="text-xs text-red-500">
                El monto en efectivo supera el total.
              </p>
            )}
          </div>
        </div>
      )}

      {showCardForm && (
        <div className="mt-4">
          <TarjetaForm onChange={onChangeCardData} />
        </div>
      )}
    </fieldset>
  );
}

export default MetodoPago;
