import { X } from 'lucide-react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 top-[-12px]">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col shadow-lg overflow-hidden m-0 mt-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 m-0 p-2 rounded-full bg-white/70 hover:bg-white/90 transition-colors z-20"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-800" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
