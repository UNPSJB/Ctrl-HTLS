import { Bed, Calendar, Percent, Tag } from 'lucide-react';
import Modal from '../ui/Modal';
import ImageLoader from '../ui/ImageLoader';
import { normalizeDiscount, roundTwo, toNumber } from '@utils/pricingUtils';

function PaqueteDetailsModal({ paquete, temporada, onClose, onReserve }) {
  if (!paquete) return null;

  const habitaciones = Array.isArray(paquete.habitaciones)
    ? paquete.habitaciones
    : [];
  const noches = Math.max(1, Math.floor(toNumber(paquete.noches)));

  // Precio total original (suma precios * noches)
  const precioTotal = roundTwo(
    habitaciones.reduce((acc, hab) => acc + toNumber(hab.precio), 0) * noches
  );

  // Descuento del paquete (normalizado)
  const packageDisc = normalizeDiscount(paquete.descuento);
  const descuentoAplicado = roundTwo(precioTotal * packageDisc);
  const precioConDescuentoPaquete = roundTwo(precioTotal * (1 - packageDisc));

  // Descuento de temporada (hotel)
  const hotelDisc = normalizeDiscount(temporada?.porcentaje);
  const finalPrice = roundTwo(precioConDescuentoPaquete * (1 - hotelDisc));

  const hasHotelDiscount = hotelDisc > 0;
  const hasPackageDiscount = packageDisc > 0;

  return (
    <Modal onClose={onClose}>
      {/* Galería de imágenes de habitaciones */}
      <div className="flex h-[19rem] gap-4 overflow-x-auto scroll-smooth p-4">
        {habitaciones.map((hab, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <ImageLoader
              name={hab.nombre}
              folder="habitaciones"
              cuadrado={false}
            />
          </div>
        ))}
      </div>

      {/* Contenido del modal */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {paquete.nombre}
        </h2>

        {/* Descuento por temporada */}
        {hasHotelDiscount && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {(hotelDisc * 100).toFixed(0)}% de descuento por temporada
            </span>
          </div>
        )}

        {/* Descripción */}
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {paquete.descripcion}
        </p>

        {/* Habitaciones incluidas */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Habitaciones incluidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {habitaciones.map((hab, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
              >
                <Bed className="h-5 w-5" />
                <span>
                  {hab.nombre} - {hab.capacidad} personas
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info adicional */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-5 w-5" />
            <span>{noches} noches</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Percent className="h-5 w-5" />
            <span>
              {(packageDisc * 100).toFixed(0)}% de descuento del paquete
            </span>
          </div>
        </div>

        {/* Tabla de precios */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Precios del paquete
          </h3>
          <div className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <div className="mb-2 flex justify-between border-b pb-2 text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Habitación</span>
              <span className="font-semibold">Precio</span>
            </div>

            <div className="space-y-2">
              {habitaciones.map((hab, index) => (
                <div
                  key={index}
                  className="flex justify-between text-gray-600 dark:text-gray-400"
                >
                  <span>
                    {hab.nombre} ({hab.capacidad} personas)
                  </span>
                  <span>
                    ${toNumber(hab.precio).toFixed(2)} × {noches} =
                    <strong className="ml-2 text-gray-800 dark:text-gray-100">
                      ${(toNumber(hab.precio) * noches).toFixed(2)}
                    </strong>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-between border-t pt-2 text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${precioTotal.toFixed(2)}</span>
            </div>

            {hasPackageDiscount && (
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>
                  Descuento Paquete ({(packageDisc * 100).toFixed(0)}%)
                </span>
                <span>- ${descuentoAplicado.toFixed(2)}</span>
              </div>
            )}

            <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold text-gray-800 dark:text-gray-100">
              <span>Total Final</span>
              {hasHotelDiscount ? (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${finalPrice.toFixed(2)}
                  </p>
                  <p className="text-md text-gray-500 line-through dark:text-gray-400">
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

      {/* Botón de reserva */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => {
            if (typeof onReserve === 'function') onReserve();
          }}
          className="w-full rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          type="button"
        >
          Reservar paquete
        </button>
      </div>
    </Modal>
  );
}

export default PaqueteDetailsModal;
