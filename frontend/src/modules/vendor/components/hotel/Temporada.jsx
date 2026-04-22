// Etiqueta visual de temporada, mostrando tanto el descuento como el aumento
const Temporada = ({ porcentaje, tipo }) => {
  if (tipo !== 'baja' && tipo !== 'alta') return null;

  const porcentajeVisual = Math.round(Math.abs(porcentaje) * 100);

  if (tipo === 'baja') {
    return (
      <span className="text-sm font-medium text-green-600 dark:text-green-400">
        {porcentajeVisual}% OFF (Temporada Baja)
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-red-600 dark:text-red-400">
      +{porcentajeVisual}% (Temporada Alta)
    </span>
  );
};

export default Temporada;
