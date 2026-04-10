import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@vendor-context/CarritoContext';
import { Clock, CreditCard, Ban, Lock } from 'lucide-react';

function ReservaPendienteView() {
  const navigate = useNavigate();
  const { cancelarReserva, reservaConfirmada } = useCarrito();

  if (!reservaConfirmada) return null;

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-500">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        
        <div className="mb-6 flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Estado de Alquiler en Curso
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              El carrito actual se encuentra bloqueado y no puede ser modificado.
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <CreditCard className="h-4 w-4" />
            Continuar al Pago
          </button>
          
          <button
            onClick={cancelarReserva}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Ban className="h-4 w-4" />
            Cancelar este Alquiler
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default ReservaPendienteView;
