import { useState } from 'react';
import { X, Users, Wifi, Bath, ImageOff } from 'lucide-react';

// Componente RoomDetailsModal convertido a .jsx
export function RoomDetailsModal({ habitacion, onClose }) {
  // Estado para controlar si la imagen se cargó correctamente o se produjo un error
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Botón para cerrar el modal */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Sección de imagen de la habitación */}
          <div className="">
            {!imgError ? (
              // Se intenta cargar la imagen desde la carpeta assets usando el nombre de la habitación y extensión .jpg
              <img
                src={`assets/${habitacion.nombre}.jpg`}
                alt={habitacion.nombre}
                onError={() => setImgError(true)}
                className="w-full h-48 object-cover"
              />
            ) : (
              // Si ocurre un error (imagen no encontrada), se muestra el icono ImageOff de lucide-react
              <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <ImageOff className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>

          {/* Detalles de la habitación */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {habitacion.nombre}
            </h2>

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

            {/* Sección de precio sin botón de reserva */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 flex justify-end">
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  ${habitacion.precio}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  por noche
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
