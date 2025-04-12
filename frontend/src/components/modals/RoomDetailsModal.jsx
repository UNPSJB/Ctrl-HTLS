import { Users, Bath, Tag } from 'lucide-react';
import Modal from './Modal';
import ImageLoader from '../ImageLoader';

const RoomDetailsModal = ({
  habitacion,
  discountCoefficient,
  onClose,
  onReserve,
}) => {
  // Cálculo de precios
  const precioBase = habitacion.precio;
  const descuentoTemporada =
    discountCoefficient < 1 ? precioBase * discountCoefficient : 0;
  const precioFinal = precioBase - descuentoTemporada;

  return (
    <Modal onClose={onClose}>
      {/* Imagen principal de la habitación */}
      <div className="relative w-full h-48">
        <ImageLoader
          name={habitacion.nombre}
          folder="habitaciones"
          cuadrado={false}
        />
      </div>

      {/* Contenido del modal */}
      <div className="p-6 overflow-y-auto flex flex-col flex-1 gap-2 custom-scrollbar">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {habitacion.nombre}
        </h2>

        {/* Descuento de temporada */}
        {discountCoefficient < 1 && (
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {(discountCoefficient * 100).toFixed(0)}% de descuento en
              temporada alta
            </span>
          </div>
        )}

        {/* Info habitación */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-5 h-5" />
            <span>Capacidad: {habitacion.capacidad} personas</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Bath className="w-5 h-5" />
            <span>Baño privado</span>
          </div>
        </div>

        {/* Precios */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4">
          <div className="flex justify-between border-b pb-2 mb-2 text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Precio base por noche</span>
            <span>${precioBase.toFixed(2)}</span>
          </div>

          {discountCoefficient < 1 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Descuento temporada alta</span>
              <span>- ${descuentoTemporada.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between border-t pt-2 mt-2 text-gray-800 dark:text-gray-100 font-bold text-lg">
            <span>Total por noche</span>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ${precioFinal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
        <button
          onClick={onReserve}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          Reservar Habitación
        </button>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
