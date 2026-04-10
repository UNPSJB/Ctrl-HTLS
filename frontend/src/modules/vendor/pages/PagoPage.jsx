import { useCarrito } from '@vendor-context/CarritoContext';
import HotelsListView from '@hotel/HotelsListView';
import PaymentSummary from '@checkout/PaymentSummary';
import ClienteData from '@client/ClienteData';

function PagoPage() {
  const { carrito, reservaConfirmada } = useCarrito();

  if (!carrito.hoteles || carrito.hoteles.length === 0) {
    if (reservaConfirmada) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p>Cancelando reserva pendiente...</p>
        </div>
      );
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-600 dark:text-gray-300">
        No hay reservas en el carrito.
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
