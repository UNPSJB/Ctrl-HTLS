import { Tag } from 'lucide-react';

const Temporada = ({ porcentaje }) => {
  return (
    <div className="flex items-center gap-2">
      <Tag className="h-4 w-4 text-green-500" />
      <span className="text-sm font-medium text-green-500">
        {Math.abs(porcentaje) * 100}% descuento en temporada
      </span>
    </div>
  );
};

export default Temporada;
