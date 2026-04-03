import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * ActionModal - Componente genérico para modales de acción (formularios, confirmaciones, etc.)
 * Diseñado con una estética premium, soporte para modo oscuro y animaciones suaves.
 */
const ActionModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showX = true,
  onConfirm,
  confirmLabel = 'Guardar Cambios',
  cancelLabel = 'Cancelar',
  loading = false,
  confirmIcon: ConfirmIcon,
  variant = 'blue', // blue, indigo, green, red, amber
  confirmDisabled = false,
}) => {
  // Manejar escape para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, loading]);

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  const variantClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    green: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    red: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 dark:bg-black/70"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${sizeClasses[size]} animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {showX && (
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
          {footer ? (
            footer
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading || confirmDisabled}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:grayscale-[0.5] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${variantClasses[variant]}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {ConfirmIcon && <ConfirmIcon className="w-4 h-4" />}
                    {confirmLabel}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
