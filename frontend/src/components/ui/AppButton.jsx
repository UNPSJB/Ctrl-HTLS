import { Loader2 } from 'lucide-react';

/**
 * AppButton - Botón genérico del sistema.
 *
 * Props:
 *   variant    - 'blue' | 'green' | 'red' | 'outline' | 'ghost' (default: 'blue')
 *   size       - 'sm' | 'md' | 'lg'        (default: 'md')
 *   fullWidth  - boolean                    (default: false)
 *   loading    - boolean: muestra spinner y bloquea interacción
 *   disabled   - boolean: deshabilita sin spinner
 *   icon       - componente lucide (se renderiza a la izquierda del label)
 *   type       - 'button' | 'submit'        (default: 'button')
 *   onClick    - callback
 *   className  - clases extra para casos puntuales
 *   children   - texto / contenido del botón
 */
export default function AppButton({
  variant = 'blue',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  className = '',
  children,
}) {
  // ── Colores por variante ──────────────────────────────────────────────────
  const variantClasses = {
    blue:  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    green: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white',
    red:   'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus:ring-gray-300 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-800',
  };

  // ── Tamaños ───────────────────────────────────────────────────────────────
  const sizeClasses = {
    sm: 'h-9  px-4 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-sm gap-2',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        // Base
        'inline-flex items-center justify-center shrink-0 font-semibold rounded-lg',
        'shadow-sm transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        'active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        // Variante
        variantClasses[variant] ?? variantClasses.blue,
        // Tamaño
        sizeClasses[size] ?? sizeClasses.md,
        // Ancho completo
        fullWidth ? 'w-full' : '',
        // Extra
        className,
      ].join(' ')}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
