import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos la utilidad correcta para el cálculo total
import { calcCartTotal } from '@utils/pricingUtils';
// Importamos el nuevo Custom Hook
import { useCartSelections } from '@hooks/useCartSelections';

function Resumen({
  habitaciones = [],
  paquetes = [],
  porcentaje = 0,
  isHighSeason,
}) {
  const navigate = useNavigate();

  const selections = useCartSelections(
    habitaciones,
    paquetes,
    porcentaje,
    isHighSeason
  );

  // Cálculo de totales con la utilidad central.
  const totals = useMemo(() => {
    return calcCartTotal(selections);
  }, [selections]); // Depende únicamente del resultado del hook memoizado

  const handleReservation = () => {
    // Aquí podrías agregar una validación final antes de la navegación
    navigate('/reserva', { state: { totals, selections } });
  };

  // Precios para la vista final
  const safeFinal = Number(totals.final ?? 0);
  const safeDescuento = Number(totals.descuento ?? 0);

  // Totales para la visualización rápida
  const selectedRoomsCount = habitaciones.length;
  const selectedPackagesCount = paquetes.length;

  return (
    <div
      className="mt-6 flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30"
      aria-label="Resumen de selección actual"
    >
      <div>
        <p className="font-medium text-blue-900 dark:text-blue-100">
          Seleccionados: {selectedRoomsCount} habitación
          {selectedRoomsCount !== 1 ? 'es' : ''}, {selectedPackagesCount}{' '}
          paquete
          {selectedPackagesCount !== 1 ? 's' : ''}
        </p>

        <p className="mt-1 text-sm font-bold text-blue-700 dark:text-blue-300">
          Total: ${safeFinal.toFixed(2)}
        </p>

        {safeDescuento > 0 && (
          <p className="text-xs text-blue-600 dark:text-blue-300">
            (Incluye ahorro por temporada: ${safeDescuento.toFixed(2)})
          </p>
        )}
      </div>
      <button
        onClick={handleReservation}
        className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        Reservar Selección
      </button>
    </div>
  );
}

export default Resumen;
