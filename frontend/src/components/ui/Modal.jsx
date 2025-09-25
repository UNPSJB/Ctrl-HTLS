import { X } from 'lucide-react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-white/70 p-2 transition-colors hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600"
          aria-label="Cerrar modal"
        >
          <X className="h-6 w-6 text-gray-600 dark:text-gray-200" />
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
