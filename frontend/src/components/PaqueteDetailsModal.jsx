import { useState } from 'react';
import { X, Bed, Calendar, Percent, CreditCard, ImageOff } from 'lucide-react';

const PaqueteDetailsModal = ({ paquete, finalPrice, onClose, onReserve }) => {
  const [imgError, setImgError] = useState(false);

  if (!paquete) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Botón para cerrar el modal */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Sección de imagen del paquete (en caso de futuras imágenes) */}
          <div className="">
            {!imgError ? (
              <img
                src={`assets/${paquete.nombre}.jpg`} // Imagen basada en el nombre del paquete
                alt={paquete.nombre}
                onError={() => setImgError(true)}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <ImageOff className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {paquete.nombre}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {paquete.descripcion}
            </p>

            {/* Habitaciones incluidas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Habitaciones incluidas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {paquete.habitaciones.map((habitacion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <Bed className="w-5 h-5" />
                    <span>
                      {habitacion.nombre} - {habitacion.capacidad} personas
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{paquete.noches} noches</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Percent className="w-5 h-5" />
                <span>{paquete.descuento}% de descuento</span>
              </div>
            </div>

            {/* Sección de precio y reserva */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 flex justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  ${finalPrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  precio final
                </p>
              </div>
              <button
                onClick={() => onReserve(paquete.nombre)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Reservar paquete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaqueteDetailsModal;
