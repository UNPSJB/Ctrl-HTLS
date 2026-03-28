import React from 'react';
import FormLabel from './FormLabel';
import FormError from './FormError';

/**
 * Componente compuesto que agrupa Label, Input y Error.
 * Simplifica la creación de campos de formulario asegurando consistencia.
 */
const FormField = ({
  label,
  error,
  required,
  icon,
  children,
  containerClassName = '',
}) => {
  // Inyectamos el estado de error al componente hijo (el input)
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { error: !!error });
    }
    return child;
  });

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <FormLabel required={required} icon={icon}>
          {label}
        </FormLabel>
      )}
      {childrenWithProps}
      <FormError error={error} />
    </div>
  );
};

export default FormField;
