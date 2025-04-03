import { useState } from 'react';
import { X, ImageOff, Bed, Calendar, Percent, Tag } from 'lucide-react';

const PaqueteDetailsModal = ({ paquete, coeficiente, onClose, onReserve }) => {
  const [imgError, setImgError] = useState(false);

  if (!paquete) return null;

  // 1️⃣ Precio total antes de aplicar cualquier descuento
  const precioTotal =
    paquete.habitaciones.reduce((acc, hab) => acc + hab.precio, 0) *
    paquete.noches;

  // 2️⃣ Monto del descuento aplicado
  const descuentoAplicado = (precioTotal * paquete.descuento) / 100;

  // 3️⃣ Precio con descuento del paquete aplicado
  const precioConDescuentoPaquete = precioTotal - descuentoAplicado;

  // 4️⃣ Precio final con coeficiente de temporada alta aplicado
  const finalPrice =
    coeficiente !== 1
      ? precioConDescuentoPaquete * (1 - coeficiente)
      : precioConDescuentoPaquete;

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
              src={`assets/${paquete.nombre}.jpg`}
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

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto flex flex-col flex-1 gap-2 custom-scrollbar">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {paquete.nombre}
          </h2>

          {/* 🔥 Mensaje de descuento en temporada alta 🔥 */}
          {coeficiente < 1 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                {coeficiente * 100}% descuento en temporada alta
              </span>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {paquete.descripcion}
          </p>

          {/* Habitaciones incluidas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Habitaciones incluidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {paquete.habitaciones.map((hab, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
                  <Bed className="w-5 h-5" />
                  <span>
                    {hab.nombre} - {hab.capacidad} personas
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

          {/* Tabla de precios */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Precios del paquete
            </h3>
            <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4">
              <div className="flex justify-between border-b pb-2 mb-2 text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Habitación</span>
                <span className="font-semibold">Precio</span>
              </div>

              {/* Lista de habitaciones con precios */}
              <div className="space-y-2">
                {paquete.habitaciones.map((hab, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-600 dark:text-gray-400"
                  >
                    <span>
                      {hab.nombre} ({hab.capacidad} personas)
                    </span>
                    <span>
                      ${hab.precio.toFixed(2)} × {paquete.noches} =
                      <strong className="ml-2 text-gray-800 dark:text-gray-100">
                        ${(hab.precio * paquete.noches).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between border-t pt-2 mt-2 text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${precioTotal.toFixed(2)}</span>
              </div>

              {/* Descuento aplicado */}
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Descuento Paquete ({paquete.descuento}%)</span>
                <span>- ${descuentoAplicado.toFixed(2)}</span>
              </div>

              {/* Precio final con o sin descuento */}
              <div className="flex justify-between border-t pt-2 mt-2 text-gray-800 dark:text-gray-100 font-bold text-lg">
                <span>Total Final</span>

                {coeficiente !== 1 ? (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${finalPrice.toFixed(2)}
                    </p>
                    <p className="text-md text-gray-500 dark:text-gray-400 line-through">
                      ${precioConDescuentoPaquete.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    ${precioConDescuentoPaquete.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección fija: precio final + botón de reservar */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
          <button
            onClick={() => onReserve(paquete.nombre)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Reservar paquete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaqueteDetailsModal;
