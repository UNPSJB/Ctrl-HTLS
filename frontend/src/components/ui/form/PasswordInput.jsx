import React, { forwardRef, useState } from 'react';
import Input from './Input';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input de contraseña con botón para mostrar/ocultar.
 * Ofrece una mejor experiencia de usuario para campos sensibles.
 */
const PasswordInput = forwardRef(({ className = '', ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group/password">
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        className={`pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex="-1"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-gray-200"
        title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
