import { Tag } from 'lucide-react';

const Temporada = ({ porcentaje }) => {
  return (
    <div className="flex items-center gap-2">
      <Tag className="w-4 h-4 text-green-500" />
      <span className="text-sm font-medium text-green-500">
        {porcentaje * 100}% descuento en temporada alta
      </span>
    </div>
  );
};

export default Temporada;
