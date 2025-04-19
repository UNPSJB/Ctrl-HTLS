import PriceTag from '../PriceTag';

const Resumen = ({ habitaciones, paquetes, porcentaje = 1 }) => {
  // Calcular suma total de precios de todas las habitaciones
  const totalHabitaciones = habitaciones.reduce((acc, hab) => {
    const inicio = new Date(hab.fechaInicio);
    const fin = new Date(hab.fechaFin);
    const noches = Math.ceil(Math.abs(fin - inicio) / (1000 * 60 * 60 * 24));
    return acc + hab.precio * noches;
  }, 0);

  // Calcular suma total de precios de todos los paquetes
  const totalPaquetes = paquetes.reduce((acc, paquete) => {
    const inicio = new Date(paquete.fechaInicio);
    const fin = new Date(paquete.fechaFin);
    const noches = Math.ceil(Math.abs(fin - inicio) / (1000 * 60 * 60 * 24));
    const descuento = paquete.descuento || 0;

    let totalPaquete = 0;
    if (Array.isArray(paquete.habitaciones)) {
      totalPaquete = paquete.habitaciones.reduce(
        (subAcc, hab) => subAcc + hab.precio * noches,
        0
      );
    } else {
      totalPaquete = (paquete.precio || 0) * noches;
    }

    // Aplicar descuento
    totalPaquete = totalPaquete * (1 - descuento / 100);

    return acc + totalPaquete;
  }, 0);

  // Total final con porcentaje
  const totalFinal = (totalHabitaciones + totalPaquetes) * 1;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-gray-100">
        <span>Total a Pagar:</span>
        <PriceTag precio={totalFinal} coeficiente={porcentaje} />
      </div>
    </div>
  );
};

export default Resumen;
