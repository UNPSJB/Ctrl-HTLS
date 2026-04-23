import { forwardRef } from 'react';
import Input from './Input';

/**
 * Input especializado para números.
 * Oculta los selectores nativos del navegador para mantener la estética limpia.
 */
const NumberInput = forwardRef(({ className = '', min = '0', ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type="number"
      min={min}
      className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
      {...props}
    />
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
