function Descuento({ descuento }) {
  const porcentaje = Math.round(descuento.porcentaje * 100);
  const textoDescuento = `${-porcentaje}% en ${descuento.cantidad_de_habitaciones}+ habitaciones`;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
      title={`Obtén un ${porcentaje}% de descuento al reservar ${descuento.cantidad_de_habitaciones} o más habitaciones.`}
    >
      {textoDescuento}
    </span>
  );
}

export default Descuento;
