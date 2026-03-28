import { forwardRef } from 'react';

/**
 * Select especializado con estilos consistentes y flecha personalizada.
 */
const SelectInput = forwardRef(({ error, className = '', children, ...props }, ref) => {
  const baseClasses = 'w-full rounded-lg border bg-white px-4 py-2.5 text-gray-700 transition-all shadow-sm appearance-none cursor-pointer';
  const focusClasses = 'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-600';
  const darkClasses = 'dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';
  const disabledClasses = 'disabled:bg-gray-50 disabled:cursor-not-allowed dark:disabled:bg-gray-800';

  return (
    <div className="relative">
      <select
        ref={ref}
        className={`${baseClasses} ${focusClasses} ${errorClasses} ${darkClasses} ${disabledClasses} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
        <svg
          className="h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.69 3.63c-.533.48-1.408.48-1.94 0l-3.69-3.63c-.408-.418-.436-1.17 0-1.615z" />
        </svg>
      </div>
    </div>
  );
});

SelectInput.displayName = 'SelectInput';

export default SelectInput;
