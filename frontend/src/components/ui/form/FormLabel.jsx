import React from 'react';

/**
 * Componente de etiqueta estandarizado para formularios.
 * Maneja automáticamente íconos y la marca de campo obligatorio (*).
 */
const FormLabel = ({ htmlFor, children, required, icon: Icon, className = '' }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
      <span>
        {children}
        {required && <span className="ml-0.5 text-red-500 font-bold" aria-hidden="true">*</span>}
      </span>
    </label>
  );
};

export default FormLabel;
