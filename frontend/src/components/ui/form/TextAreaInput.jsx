import { forwardRef, useState, useCallback } from 'react';

/**
 * Área de texto multi-línea con estilos consistentes.
 * Soporta la prop `showCount` junto con `maxLength` para mostrar un contador
 * de caracteres en tiempo real. Compatible con react-hook-form (modo uncontrolled).
 */
const TextAreaInput = forwardRef(({ error, className = '', showCount = false, maxLength, onChange, ...props }, ref) => {
  const baseClasses = 'w-full rounded-lg border bg-white px-4 py-2.5 text-gray-700 transition-all shadow-sm resize-none min-h-[100px]';
  const focusClasses = 'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-600';
  const darkClasses = 'dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400';
  const disabledClasses = 'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800';

  const [charCount, setCharCount] = useState(0);

  // Combina el ref externo (de RHF o cualquier padre) con la inicialización del contador.
  // RHF setea el valor vía su ref callback antes de que corramos el resto,
  // por lo que podemos leer el valor inicial correctamente después de propagarlo.
  const setRef = useCallback((el) => {
    // Propagar el ref al padre primero (RHF seteará el valor aquí)
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;

    // Leer el valor inicial que RHF ya seteó
    if (el) {
      setCharCount(el.value?.length ?? 0);
    }
  }, [ref]);

  // Interceptar onChange para actualizar el contador en tiempo real
  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  const mostrarContador = showCount && maxLength;

  return (
    <div className="relative">
      <textarea
        ref={setRef}
        onChange={handleChange}
        maxLength={maxLength}
        className={`${baseClasses} ${focusClasses} ${errorClasses} ${darkClasses} ${disabledClasses} ${mostrarContador ? 'pb-6' : ''} ${className}`}
        {...props}
      />
      {mostrarContador && (
        <span
          className={`absolute bottom-2 right-3 text-xs font-medium tabular-nums pointer-events-none transition-colors ${
            charCount >= maxLength
              ? 'text-red-500'
              : charCount >= maxLength * 0.85
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {charCount}/{maxLength}
        </span>
      )}
    </div>
  );
});

TextAreaInput.displayName = 'TextAreaInput';

export default TextAreaInput;
