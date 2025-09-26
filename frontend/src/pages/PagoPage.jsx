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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Confirmar y Pagar
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Revisá los detalles antes de procesar el pago.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ClienteData />
          <HotelsListView />
        </div>

        <PaymentSummary />
      </div>
    </div>
  );
}

export default PagoPage;
