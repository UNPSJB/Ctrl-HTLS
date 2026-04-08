import { Tag } from 'lucide-react';

// Etiqueta visual de temporada baja (descuento). Si es alta, no se renderiza.
const Temporada = ({ porcentaje, tipo }) => {
  // Temporada alta no se muestra visualmente, solo se aplica al precio
  if (tipo !== 'baja') return null;

  const porcentajeVisual = Math.round(Math.abs(porcentaje) * 100);

  return (
    <div className="flex items-center gap-2">
      <Tag className="h-4 w-4 text-green-500" />
      <span className="text-sm font-medium text-green-500">
        {porcentajeVisual}% descuento por temporada
      </span>
    </div>
  );
};

export default Temporada;
