import { forwardRef } from 'react';
import Input from './Input';

/**
 * Input especializado para teléfonos.
 */
const TelInput = forwardRef((props, ref) => {
  return <Input ref={ref} type="tel" placeholder="Ej: +54 376 4123456" {...props} />;
});

TelInput.displayName = 'TelInput';

export default TelInput;
