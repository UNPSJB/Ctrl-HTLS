
/**
 * Componente base de entrada (input) estandarizado.
 * Implementa todos los estilos de Tailwind (Dark Mode, Focus, Error) y usa forwardRef.
 */
const Input = forwardRef(({
  error,
  icon,
  hideError,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full rounded-lg border bg-white px-4 py-2.5 text-gray-700 transition-all shadow-sm';
  const focusClasses = 'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-600';
  const darkClasses = 'dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';
  const disabledClasses = 'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800 transition-colors';

  return (
    <div className="relative group/input">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
          <span className="text-sm font-medium">$</span>
        </div>
      )}
      <input
        ref={ref}
        className={`${baseClasses} ${focusClasses} ${errorClasses} ${darkClasses} ${disabledClasses} ${icon ? 'pl-7' : ''} ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
