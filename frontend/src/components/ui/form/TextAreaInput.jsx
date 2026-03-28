import { forwardRef } from 'react';

/**
 * Área de texto multi-línea con estilos consistentes.
 */
const TextAreaInput = forwardRef(({ error, className = '', ...props }, ref) => {
  const baseClasses = 'w-full rounded-lg border bg-white px-4 py-2.5 text-gray-700 transition-all shadow-sm resize-none min-h-[100px]';
  const focusClasses = 'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-600';
  const darkClasses = 'dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';
  const disabledClasses = 'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800';

  return (
    <textarea
      ref={ref}
      className={`${baseClasses} ${focusClasses} ${errorClasses} ${darkClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
});

TextAreaInput.displayName = 'TextAreaInput';

export default TextAreaInput;
