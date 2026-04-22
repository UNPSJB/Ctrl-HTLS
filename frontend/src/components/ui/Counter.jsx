import { Minus, Plus } from 'lucide-react';

/**
 * Componente contador unificado para incrementar o decrementar valores numéricos.
 * Puede usarse de dos formas:
 * 1. Pasando `onChange(value)` que maneja la lógica internamente.
 * 2. Pasando `onIncrement` y `onDecrement` para manejo externo manual.
 */
function Counter({
  value = 0,
  onChange,
  onIncrement,
  onDecrement,
  min = 0,
  max = 100,
  icon: Icon,
  className = '',
  disabled = false
}) {
  const handleDecrement = () => {
    if (onDecrement) {
      onDecrement();
    } else if (onChange && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (onIncrement) {
      onIncrement();
    } else if (onChange && value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`relative inline-flex h-10 min-w-[90px] items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 ${disabled ? 'opacity-50 grayscale' : ''} ${className}`}>
      {/* Icono descriptivo (Opcional) */}
      {Icon && (
        <div className="flex h-full items-center pl-3 pr-1 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* Botón Decremento */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="flex h-full w-9 shrink-0 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Decrementar"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      {/* Valor Central */}
      <div className="flex-1 text-center font-bold text-gray-700 dark:text-gray-200 select-none">
        {value}
      </div>

      {/* Botón Incremento */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="flex h-full w-9 shrink-0 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-500 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Incrementar"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default Counter;
