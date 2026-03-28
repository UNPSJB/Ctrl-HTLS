/**
 * Componente de mensaje de error estandarizado para formularios.
 * Compatible con strings o con el objeto de error de react-hook-form.
 */
const FormError = ({ error, className = '' }) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  if (!message) return null;

  return (
    <p
      role="alert"
      className={`mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 ${className}`}
    >
      {message}
    </p>
  );
};

export default FormError;
