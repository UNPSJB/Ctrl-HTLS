import { Minus, Plus } from 'lucide-react';

/**
 * Componente especializado para valores numéricos que requieren incremento/decremento manual.
 * Ideal para conteo de pasajeros, habitaciones, etc.
 */
const CounterInput = ({
  value,
  onChange,
  min = 1,
  max = 100,
  icon: Icon,
  className = '',
  disabled = false
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`relative flex h-10 w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 ${disabled ? 'opacity-50 grayscale' : ''} ${className}`}>
      {/* Icono descriptivo (Ej: Users) */}
      {Icon && (
        <div className="flex h-full items-center pl-3 pr-2 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* Botón Decremento */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="flex h-full w-8 items-center justify-center text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-gray-700"
      >
        <Minus className="h-3 w-3" />
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
        className="flex h-full w-8 items-center justify-center text-gray-400 transition-colors hover:bg-gray-50 hover:text-blue-500 disabled:opacity-30 dark:hover:bg-gray-700"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
};

export default CounterInput;
