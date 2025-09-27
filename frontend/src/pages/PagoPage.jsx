import { useCarrito } from '@context/CarritoContext';
import HotelsListView from '@hotel/HotelsListView';
import PaymentSummary from '@checkout/PaymentSummary';
import ClienteData from '@components/client/ClienteData';

function PagoPage() {
  const { carrito } = useCarrito();

  if (!carrito.hoteles || carrito.hoteles.length === 0) {
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

        {/* Sidebar sticky - columna derecha */}
        <div className="w-80 shrink-0">
          <PaymentSummary />
        </div>
      </div>
    </div>
  );
}

export default PagoPage;
