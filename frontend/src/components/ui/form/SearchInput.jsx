import { forwardRef } from 'react';
import { Search } from 'lucide-react';

/**
 * Input especializado para búsquedas dinámicas en tablas y filtros.
 * Incluye ícono de lupa y estilos de borde altamente redondeado.
 */
const SearchInput = forwardRef(({
  className = '',
  containerClassName = '',
  onClear,
  ...props
}, ref) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        ref={ref}
        type="text"
        className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 transition-all shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${className}`}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
