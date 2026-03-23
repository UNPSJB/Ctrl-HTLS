import React, { forwardRef } from 'react';
import Input from './Input';

/**
 * Input especializado para correos electrónicos.
 */
const EmailInput = forwardRef((props, ref) => {
  return <Input ref={ref} type="email" placeholder="ejemplo@correo.com" {...props} />;
});

EmailInput.displayName = 'EmailInput';

export default EmailInput;
