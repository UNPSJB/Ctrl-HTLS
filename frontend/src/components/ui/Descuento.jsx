import { Percent } from 'lucide-react';

function Descuento({ descuento }) {
  const textoDescuento = `${descuento.porcentaje}% OFF en ${descuento.cantidad}+ habitaciones`;

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-600 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
      title={`Descuento aplicado al reservar ${descuento.cantidad} o más habitaciones.`}
    >
      <Percent className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      {textoDescuento}
    </span>
  );
}

export default Descuento;
