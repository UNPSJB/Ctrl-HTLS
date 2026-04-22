import { Bed, Calendar, CheckCircle, Package } from 'lucide-react';
import Modal from '@ui/Modal';
import { normalizeDiscount, roundTwo, toNumber, formatCurrency } from '@utils/pricingUtils';
import { capitalizeWords } from '@/utils/stringUtils';
import dateUtils from '@/utils/dateUtils';

const { formatFecha } = dateUtils;

function PaqueteDetailsModal({ paquete, onClose, onReserve }) {
  if (!paquete) return null;

  const habitaciones = Array.isArray(paquete.habitaciones)
    ? paquete.habitaciones
    : [];
  const noches = Math.max(1, Math.floor(toNumber(paquete.noches)));

  const precioTotal = roundTwo(
    habitaciones.reduce((acc, hab) => acc + toNumber(hab.precio), 0) * noches
  );

  const packageDisc = normalizeDiscount(paquete.descuento);
  const finalPrice = roundTwo(precioTotal * (1 - packageDisc));

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={capitalizeWords(paquete.nombre)}
      description="Consulte la configuración de habitaciones y el desglose de precios del paquete turístico."
      onConfirm={() => {
        if (typeof onReserve === 'function') onReserve();
      }}
      confirmLabel="Seleccionar Paquete"
    >
      <div className="flex flex-col gap-6">

        {/* Bloque 1: Configuración Operativa (Grilla) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-md">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold flex items-center justify-between">
                  Fechas del Paquete 
                  <span className="text-indigo-600 dark:text-indigo-400 tracking-normal ml-2 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded text-[10px]">
                    {noches} NOCHES
                  </span>
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {formatFecha(paquete.fecha_inicio || paquete.fechaInicio)} al {formatFecha(paquete.fecha_fin || paquete.fechaFin)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-md">
                <Bed className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Habitaciones</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{habitaciones.length} unidades incluidas</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 sm:pt-0 sm:border-l border-gray-100 sm:pl-4 dark:border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-1">Detalle del Grupo</span>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 font-medium">
              {habitaciones.map((hab, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
                  Habitacion {capitalizeWords(hab.nombre)} ({hab.capacidad} personas)
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bloque 2: Liquidación Económica */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            Liquidación Total del Paquete
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-end">
              <span className="text-gray-900 dark:text-white font-semibold flex flex-col">
                Valor del Paquete
              </span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(finalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PaqueteDetailsModal;
