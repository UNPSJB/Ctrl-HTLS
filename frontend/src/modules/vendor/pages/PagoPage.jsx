import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@vendor-context/CarritoContext';
import { useBusqueda } from '@vendor-context/BusquedaContext';
import HotelsListView from '@hotel/HotelsListView';
import PaymentSummary from '@checkout/PaymentSummary';
import ClienteData from '@client/ClienteData';

function PagoPage() {
  const navigate = useNavigate();
  const { carrito, reservaConfirmada } = useCarrito();
  const { limpiarFiltros } = useBusqueda();

  const hasItems = carrito.hoteles && carrito.hoteles.length > 0;

  useEffect(() => {
    // Si el carrito está vacío y no hay una reserva pendiente de cancelación en el servidor,
    // limpiamos los filtros de búsqueda y regresamos al buscador (Home).
    if (!hasItems && !reservaConfirmada) {
      limpiarFiltros();
      navigate('/', { replace: true });
    }
  }, [hasItems, reservaConfirmada, navigate, limpiarFiltros]);

  if (!hasItems) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p>{reservaConfirmada ? 'Cancelando reserva pendiente...' : 'Redirigiendo...'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start animate-in fade-in duration-500">
      {/* Contenido principal - columna izquierda (60%) */}
      <div className="space-y-6 lg:col-span-3">
        <ClienteData />
        <HotelsListView />
      </div>

      {/* Columna derecha sticky (40%) */}
      <div className="lg:sticky lg:top-6 lg:col-span-2">
        <PaymentSummary />
      </div>
    </div>
  );
}

export default PagoPage;
