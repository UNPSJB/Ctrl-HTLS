import { Users, Bath, Tag, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import ImageLoader from '../ui/ImageLoader';
import { normalizarDescuento } from '@utils/pricingUtils';

const RoomDetailsModal = ({ habitacion, coeficiente, onClose, onReserve }) => {
  // Cálculo de precios
  const precioBase = habitacion.precio ?? 100;
  const descuentoTemporada = normalizarDescuento(coeficiente) || 0;
  const precioFinal =
    Math.round(precioBase * (1 - descuentoTemporada) * 100) / 100;
  const montoDescuento = precioBase - precioFinal;

  const tieneDescuento = descuentoTemporada > 0;

  return (
    <Modal onClose={onClose}>
      {/* Imagen principal de la habitación */}
      <div className="relative h-48 w-full">
        <ImageLoader
          name={habitacion.nombre}
          folder="habitaciones"
          cuadrado={false}
        />
      </div>

      {/* Contenido del modal */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {habitacion.nombre}
        </h2>

        {/* Descuento de temporada */}
        {tieneDescuento && (
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {(descuentoTemporada * 100).toFixed(0)}% de descuento por
              temporada alta
            </span>
          </div>
        )}

        {/* Información de la habitación */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="h-5 w-5" />
            <span>Capacidad: {habitacion.capacidad} personas</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Bath className="h-5 w-5" />
            <span>Baño privado incluido</span>
          </div>

          {habitacion.piso && habitacion.numero && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="h-5 w-5" />
              <span>
                Piso {habitacion.piso} - Habitación {habitacion.numero}
              </span>
            </div>
          )}
        </div>

        {/* Desglose de precios */}
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            Desglose de precio por noche
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Precio base</span>
              <span>${precioBase.toFixed(2)}</span>
            </div>

            {tieneDescuento && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Descuento temporada alta</span>
                <span>-${montoDescuento.toFixed(2)}</span>
              </div>
            )}

            <hr className="border-gray-300 dark:border-gray-600" />

            <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100">
              <span>Total por noche</span>
              <span
                className={
                  tieneDescuento ? 'text-green-600 dark:text-green-400' : ''
                }
              >
                ${precioFinal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>• Wi-Fi gratuito</p>
          <p>• Aire acondicionado</p>
          <p>• Servicio de limpieza diario</p>
          <p>• Acceso 24 horas</p>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={onReserve}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Seleccionar Habitación
        </button>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
