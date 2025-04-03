import { useState } from 'react';
import { X, Users, Wifi, Bath, ImageOff, Tag } from 'lucide-react';

export function RoomDetailsModal({ habitacion, coeficiente, onClose }) {
  const [imgError, setImgError] = useState(false);

  // Precio base de la habitación por noche
  let precioBase = habitacion.precio;

  // Aplicamos descuento de temporada si corresponde
  let descuentoTemporada = coeficiente < 1 ? precioBase * coeficiente : 0;
  let precioFinal = precioBase - descuentoTemporada;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col shadow-lg overflow-hidden">
        {/* Sección de imagen */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          {!imgError ? (
            <img
              src={`assets/${habitacion.nombre}.jpg`}
              alt={habitacion.nombre}
              onError={() => setImgError(true)}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <ImageOff className="w-12 h-12 text-gray-500" />
            </div>
          )}
        </div>

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto flex flex-col flex-1 gap-2 custom-scrollbar">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {habitacion.nombre}
          </h2>

          {/* 🔥 Descuento de temporada alta 🔥 */}
          {coeficiente < 1 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                {(coeficiente * 100).toFixed(0)}% de descuento en temporada alta
              </span>
            </div>
          )}

          {/* Información de la habitación */}
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

          {/* Amenidades de la habitación */}
          {habitacion.amenities && habitacion.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Amenidades
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {habitacion.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de precios */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4">
            <div className="flex justify-between border-b pb-2 mb-2 text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Precio base por noche</span>
              <span>${precioBase.toFixed(2)}</span>
            </div>

            {/* Descuento por temporada si aplica */}
            {coeficiente < 1 && (
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Descuento temporada alta</span>
                <span>- ${descuentoTemporada.toFixed(2)}</span>
              </div>
            )}

            {/* Precio final por noche */}
            <div className="flex justify-between border-t pt-2 mt-2 text-gray-800 dark:text-gray-100 font-bold text-lg">
              <span>Total por noche</span>

              {coeficiente < 1 ? (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${precioFinal.toFixed(2)}
                  </p>
                  <p className="text-md text-gray-500 dark:text-gray-400 line-through">
                    ${precioBase.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  ${precioBase.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botón fijo en la parte inferior */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Reservar Habitacion
          </button>
        </div>
      </div>
    </div>
  );
}
