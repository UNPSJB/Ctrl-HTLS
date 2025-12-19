import { useCarrito } from '@context/CarritoContext';
import HotelsListView from '@hotel/HotelsListView';
import PaymentSummary from '@checkout/PaymentSummary';
import ClienteData from '@components/client/ClienteData';

function PagoPage() {
  // Ahora extraemos también reservaConfirmada
  const { carrito, reservaConfirmada } = useCarrito();

  // Verifica si el carrito está vacío
  if (!carrito.hoteles || carrito.hoteles.length === 0) {
    // Si hay una reserva confirmada pero el carrito está vacío,
    // significa que el contexto está procesando la cancelación automática.
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
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Confirmar y Pagar
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Revisá los detalles antes de procesar el pago.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Contenido principal - columna izquierda */}
        <div className="flex-1 space-y-6">
          <ClienteData />
          <HotelsListView />
        </div>

        <div className="w-96 shrink-0">
          <PaymentSummary />
        </div>
      </div>
    </div>
  );
}

export default PagoPage;
