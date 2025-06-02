import { X } from 'lucide-react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 top-[-12px]">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col shadow-lg overflow-hidden">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/70 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 transition-colors z-20"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-200" />
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
