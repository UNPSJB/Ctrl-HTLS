import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@vendor-context/CarritoContext';
import { Clock, CreditCard, Ban, Lock, Loader2 } from 'lucide-react';

function ReservaPendienteView() {
  const navigate = useNavigate();
  const { cancelarReserva, reservaConfirmada, isCanceling } = useCarrito();

  if (!reservaConfirmada) return null;

  return (
    <div className="flex w-full flex-col animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">

        <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
            <Clock className="h-6 w-6 text-red-400 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Estado de Alquiler en Curso
            </h2>
            <p className="flex items-center gap-1.5 text-sm font-medium text-red-500/80 dark:text-red-400/80">
              <Lock className="h-3.5 w-3.5" />
              Sistema bloqueado por reserva activa
            </p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Los lugares seleccionados ya se encuentran reservados previemente en el sistema. Para volver a buscar disponibilidad de habitaciones u otros hoteles, primero debe <strong>cancelar</strong> este alquiler en curso. Si desea avanzar y finalizar la operación, por favor proceda directamente a la <strong>caja de pago</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/pago')}
            disabled={isCanceling}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-800"
          >
            <CreditCard className="h-4 w-4" />
            Continuar al Pago
          </button>

          <button
            onClick={cancelarReserva}
            disabled={isCanceling}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            {isCanceling ? 'Cancelando...' : 'Cancelar este Alquiler'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ReservaPendienteView;
