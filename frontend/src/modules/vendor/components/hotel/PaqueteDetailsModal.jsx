import { Bed, Calendar, Tag, CheckCircle, Package } from 'lucide-react';
import Modal from '@ui/Modal';
import { normalizeDiscount, roundTwo, toNumber, calcSeasonalPrice, formatCurrency } from '@utils/pricingUtils';
import { capitalizeWords } from '@/utils/stringUtils';

function PaqueteDetailsModal({ paquete, temporada, onClose, onReserve }) {
  if (!paquete) return null;

  const habitaciones = Array.isArray(paquete.habitaciones)
    ? paquete.habitaciones
    : [];
  const noches = Math.max(1, Math.floor(toNumber(paquete.noches)));

  const precioTotal = roundTwo(
    habitaciones.reduce((acc, hab) => acc + toNumber(hab.precio), 0) * noches
  );

  const packageDisc = normalizeDiscount(paquete.descuento);
  const descuentoAplicado = roundTwo(precioTotal * packageDisc);
  const precioConDescuentoPaquete = roundTwo(precioTotal * (1 - packageDisc));

  // Aplicamos ajuste de temporada (alta sube, baja baja)
  const finalPrice = temporada
    ? calcSeasonalPrice(precioConDescuentoPaquete, temporada)
    : precioConDescuentoPaquete;

  const esBaja = temporada?.tipo === 'baja';
  const porcentajeTemporada = Math.round(toNumber(temporada?.porcentaje) * 100);
  const hasHotelDiscount = esBaja && toNumber(temporada?.porcentaje) > 0;
  const hasPackageDiscount = packageDisc > 0;

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
        {/* Banner de descuentos combinados */}
        {(hasHotelDiscount || hasPackageDiscount) && (
          <div className="flex flex-col gap-2">
            {hasPackageDiscount && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Bonificación de paquete del {(packageDisc * 100).toFixed(0)}% incluida
                </span>
              </div>
            )}
            {hasHotelDiscount && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <Tag className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {porcentajeTemporada}% de descuento adicional por temporada baja
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bloque 1: Configuración Operativa (Grilla) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-md">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Duración</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{noches} noches de estancia</span>
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
            <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
              <span>Tarifa Base (Habitaciones × {noches} noches)</span>
              <span>{formatCurrency(precioTotal)}</span>
            </div>

            {hasPackageDiscount && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                <span>Bonificación Especial de Paquete ({(packageDisc * 100).toFixed(0)}%)</span>
                <span>-{formatCurrency(descuentoAplicado)}</span>
              </div>
            )}

            {hasHotelDiscount && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                <span>Bonificación Temporal Temporada Baja</span>
                <span>-{formatCurrency(precioConDescuentoPaquete - finalPrice)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-end">
              <span className="text-gray-900 dark:text-white font-semibold flex flex-col">
                Valor Neto Final
              </span>
              <span
                className={`text-2xl font-bold ${hasHotelDiscount || hasPackageDiscount ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'
                  }`}
              >
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
