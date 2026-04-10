// Etiqueta visual para el descuento por cantidad de habitaciones
function Descuento({ descuento }) {
  if (!descuento || !descuento.porcentaje || !descuento.cantidad_de_habitaciones) return null;

  const porcentaje = Math.round(descuento.porcentaje * 100);

  return (
    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
      {porcentaje}% OFF (Por {descuento.cantidad_de_habitaciones} habitaciones)
    </span>
  );
}

export default Descuento;
