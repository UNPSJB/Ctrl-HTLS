const Resumen = ({ habitaciones, porcentaje = 1 }) => {
  // Calcular suma total de precios de todas las habitaciones
  const total = habitaciones.reduce((acc, hab) => {
    const inicio = new Date(hab.fechaInicio);
    const fin = new Date(hab.fechaFin);
    const noches = Math.ceil(Math.abs(fin - inicio) / (1000 * 60 * 60 * 24));
    return acc + hab.precio * noches;
  }, 0);

  // Aplicar coeficiente de descuento
  const totalFinal = total * (1 + porcentaje);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
        <span>Total a Pagar:</span>
        <span>${totalFinal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default Resumen;
