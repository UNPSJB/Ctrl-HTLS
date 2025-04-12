import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

const Contador = ({ initial = 0, max = 10, onChange }) => {
  const [cantidad, setCantidad] = useState(initial);

  // Avisamos al componente padre cada vez que cambia la cantidad
  useEffect(() => {
    onChange(cantidad);
  }, [cantidad]);

  const incrementar = () => {
    if (cantidad < max) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementar = () => {
    if (cantidad > 0) {
      setCantidad(cantidad - 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={decrementar}
        className="p-1 border rounded-md text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-500 hover:text-gray-800 dark:hover:text-white transition"
      >
        <Minus size={16} />
      </button>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {cantidad}
      </span>
      <button
        onClick={incrementar}
        className="p-1 border rounded-md text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-500 hover:text-gray-800 dark:hover:text-white transition"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default Contador;
