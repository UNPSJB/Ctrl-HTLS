import { Users, Bath, Tag, MapPin, CheckCircle } from 'lucide-react';
import Modal from '@ui/Modal';
import { calcSeasonalPrice, toNumber } from '@utils/pricingUtils';

function RoomDetailsModal({ habitacion, temporada, onClose, onReserve }) {
  const precioBase = habitacion?.precio ?? 100;

  // Calcular precio ajustado según temporada (alta sube, baja baja)
  const precioFinal = temporada
    ? calcSeasonalPrice(precioBase, temporada)
    : precioBase;

  const esBaja = temporada?.tipo === 'baja';
  const porcentajeVisual = Math.round(toNumber(temporada?.porcentaje) * 100);
  const montoDescuento = Math.round((precioBase - precioFinal) * 100) / 100;

  // Solo mostramos visualmente el descuento si es temporada baja
  const tieneDescuentoVisible = esBaja && montoDescuento > 0;

  return (
    <Modal 
      isOpen={true}
      onClose={onClose}
      title={habitacion?.nombre ?? "Detalles de Habitación"}
      description="Consulta las capacidades y desglose de precio de la habitación."
      onConfirm={onReserve}
      confirmLabel="Seleccionar Habitación"
    >
      <div className="flex flex-col gap-6">
        {tieneDescuentoVisible && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <Tag className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-600 dark:text-green-400">
              {porcentajeVisual}% de descuento por temporada baja
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-md">
                 <Users className="h-4 w-4" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Capacidad</span>
                 <span className="text-gray-800 dark:text-gray-200 font-medium">{habitacion?.capacidad ?? '—'} personas máximas</span>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-md">
                 <Bath className="h-4 w-4" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Baño</span>
                 <span className="text-gray-800 dark:text-gray-200 font-medium">Baño privado incluido</span>
               </div>
             </div>
          </div>

          <div className="space-y-2 pt-2 sm:pt-0 sm:border-l border-gray-100 sm:pl-4 dark:border-gray-800">
            {habitacion?.piso && habitacion?.numero && (
              <div className="flex items-center gap-3 mb-4">
               <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-md">
                 <MapPin className="h-4 w-4" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Ubicación Física</span>
                 <span className="text-gray-800 dark:text-gray-200 font-medium">
                   Piso {habitacion.piso} - Hub {habitacion.numero}
                 </span>
               </div>
              </div>
            )}
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 mt-2 font-medium">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Wi-Fi gratuito veloz</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Climatización / Aire</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Servicio limpieza</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            Liquidación por Noche
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
              <span>Tarifa Referencia</span>
              <span>${precioBase.toFixed(2)}</span>
            </div>

            {tieneDescuentoVisible && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                <span>Aplicación Temporada Baja</span>
                <span>-${montoDescuento.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-end">
              <span className="text-gray-900 dark:text-white font-semibold flex flex-col">
                 Valor Neto
                 <span className="text-[10px] text-gray-500 font-normal uppercase tracking-widest mt-0.5">IVA Incluido</span>
              </span>
              <span
                className={`text-2xl font-bold ${
                  tieneDescuentoVisible ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                ${precioFinal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default RoomDetailsModal;
