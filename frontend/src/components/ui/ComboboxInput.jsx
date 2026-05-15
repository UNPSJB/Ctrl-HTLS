import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Combobox con búsqueda en tiempo real, altura máxima controlada y soporte dark mode.
 * Reemplaza SelectInput en contextos donde la lista de opciones puede ser extensa.
 *
 * @param {Array}    options     - Array de { value, label } o strings simples.
 * @param {string}   value       - Valor actualmente seleccionado.
 * @param {Function} onChange    - Callback que recibe el value al seleccionar.
 * @param {string}   placeholder - Texto mostrado cuando no hay selección.
 * @param {boolean}  disabled    - Deshabilita el componente.
 * @param {string}   className   - Clases adicionales para el input.
 * @param {object}   error       - Si existe, aplica estilos de error.
 * @param {React.ElementType} icon - Ícono opcional a la izquierda.
 */
export default function ComboboxInput({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  error,
  icon: Icon,
}) {
  // Normalizar las opciones al formato { value, label }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Encontrar el label de la opción actualmente seleccionada
  const getSelectedLabel = useCallback(() => {
    if (!value) return '';
    const found = normalizedOptions.find((opt) => String(opt.value) === String(value));
    return found ? found.label : '';
  }, [value, options]);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Al abrir, mostrar el label actual en el input para facilitar la búsqueda
  const handleOpen = () => {
    if (disabled) return;
    setQuery('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Al cerrar, restaurar el label del valor seleccionado
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  // Cerrar al hacer click fuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // Seleccionar una opción del dropdown
  const handleSelect = (opt) => {
    onChange(opt.value);
    handleClose();
  };

  // Filtrar opciones según el texto escrito (case-insensitive)
  const filteredOptions = query
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      )
    : normalizedOptions;

  // Texto que muestra el input en estado cerrado o al escribir
  const displayValue = isOpen ? query : getSelectedLabel();

  // Clases base — alineadas con SelectInput.jsx
  const baseClasses =
    'w-full rounded-lg border bg-white px-4 py-2.5 text-gray-700 transition-all shadow-sm';
  const focusClasses =
    'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500/20'
    : 'border-gray-200 dark:border-gray-600';
  const darkClasses = 'dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';
  const disabledClasses = disabled
    ? 'bg-gray-50 cursor-not-allowed dark:bg-gray-800 opacity-60'
    : 'cursor-pointer';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input de búsqueda / display */}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!isOpen}
          onClick={handleOpen}
          onChange={(e) => setQuery(e.target.value)}
          className={`${baseClasses} ${focusClasses} ${errorClasses} ${darkClasses} ${disabledClasses} ${Icon ? 'pl-10' : ''} pr-10 ${className}`}
        />
        {/* Ícono de chevron — igual que SelectInput */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
          <svg
            className={`h-4 w-4 fill-current transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.69 3.63c-.533.48-1.408.48-1.94 0l-3.69-3.63c-.408-.418-.436-1.17 0-1.615z" />
          </svg>
        </div>
      </div>

      {/* Dropdown — overlay flotante con scroll */}
      {isOpen && (
        <ul className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onMouseDown={(e) => {
                  // Evitar que el blur del input cierre el dropdown antes de procesar
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white ${
                  String(opt.value) === String(value)
                    ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-gray-600 dark:text-white'
                    : ''
                }`}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
              Sin resultados
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
