import { useCarrito } from '@context/CarritoContext';
import HotelsListView from '@components/HotelsListView';
import ResumenPago from '@components/ResumenPago';
import ClienteData from '@components/ClienteData';

function PagoPage() {
  const { carrito } = useCarrito();

  if (!carrito.hoteles || carrito.hoteles.length === 0) {
    return (
      <div className="flex justify-center items-center text-gray-600 dark:text-gray-300 min-h-[60vh]">
        No hay reservas en el carrito.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Confirmar y Pagar
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Revisá los detalles antes de procesar el pago.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ClienteData />
          <HotelsListView />
        </div>

        <ResumenPago />
      </div>
    </div>
  );
}

export default PagoPage;
