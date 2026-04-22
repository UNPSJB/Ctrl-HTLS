import { useEffect, useMemo } from 'react';
import { formatCurrency } from '@utils/pricingUtils';
import TarjetaForm from './TarjetaForm';
import { SelectInput, NumberInput } from '@ui/form';

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

  return (
    <fieldset className={`mt-3 ${className}`} aria-label="Método de pago">
      <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Método de Pago
      </legend>

      <SelectInput
        id="metodo-pago-select"
        value={metodoPago}
        onChange={(e) => onChangeMetodo(e.target.value)}
      >
        {methods.map((m) => (
          <option key={m.id} value={m.id} disabled={m.disabled}>
            {m.label}
          </option>
        ))}
      </SelectInput>

      {!puntoEnabled && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          La opción <strong>Puntos</strong> requiere {baseTotal} puntos.
          (Disponibles: {clientPoints})
        </p>
      )}

      {metodoPago === 'Mixto' && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300">Monto en Efectivo</span>
              <div className="mt-1">
                <NumberInput
                  min="0"
                  max={baseTotal}
                  step="0.01"
                  value={montoEfectivo || ''}
                  onChange={(e) => onChangeMontoEfectivo(Number(e.target.value))}
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
