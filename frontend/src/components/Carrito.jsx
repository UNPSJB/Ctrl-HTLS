import { X, Trash2, CreditCard, House, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import hotelesData from '@/data/hotels.json';
import Temporada from './Temporada';

const Carrito = ({ isOpen, onClose }) => {
  const { carrito, removerHabitacion, removerPaquete } = useCarrito();

  if (!isOpen) return null;

  // Construimos el listado de elementos agrupados por hotel
  const elementosCarrito = carrito.hoteles
    .map((itemHotel) => {
      // Buscamos datos completos del hotel (de prueba) en nuestro JSON
      const datosHotel = hotelesData.find((h) => h.id === itemHotel.idHotel);
      if (!datosHotel) return null;

      // Obtenemos la info de temporada desde el contexto
      const enTemporadaAlta = itemHotel.temporada === 'alta';
      const descuentoExtra = enTemporadaAlta ? itemHotel.coeficiente : 0;

      return {
        idHotel: itemHotel.idHotel,
        nombreHotel: datosHotel.nombre,
        enTemporadaAlta,
        descuentoExtra,
        // Habitaciones sin mostrar descuento en cada una
        habitaciones: itemHotel.habitaciones
          .map((idHab) => {
            const hab = datosHotel.habitaciones.find((h) => h.id === idHab);
            if (!hab) return null;
            const precioFinal =
              descuentoExtra > 0
                ? hab.precio * (1 - descuentoExtra)
                : hab.precio;
            return { ...hab, precioFinal };
          })
          .filter(Boolean),
        // Paquetes sin mostrar descuento en cada uno
        paquetes: itemHotel.paquetes
          .map((idPack) => {
            const pack = datosHotel.paquetes.find((p) => p.id === idPack);
            if (!pack) return null;
            const precioBase =
              pack.habitaciones.reduce((acum, hab) => acum + hab.precio, 0) *
              (1 - pack.descuento / 100) *
              pack.noches;
            const precioFinal =
              descuentoExtra > 0
                ? precioBase * (1 - descuentoExtra)
                : precioBase;
            return { ...pack, precioFinal };
          })
          .filter(Boolean),
      };
    })
    .filter(Boolean);

  let total = 0;
  elementosCarrito.forEach((item) => {
    item.habitaciones.forEach((hab) => {
      total += hab.precioFinal;
    });
    item.paquetes.forEach((pack) => {
      total += pack.precioFinal;
    });
  });

  return (
    <div className="fixed inset-0 z-50">
      {/* Fondo semitransparente */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel del carrito */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Carrito de Reservas
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {elementosCarrito.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No hay reservas en el carrito
                </p>
              </div>
            ) : (
              elementosCarrito.map((item) => (
                <div key={item.idHotel} className="mb-6">
                  {/* Cabecera del hotel: nombre y, si corresponde, descuento */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-4">
                      {item.nombreHotel}
                      {item.enTemporadaAlta && (
                        <Temporada porcentaje={item.descuentoExtra} />
                      )}
                    </h3>
                  </div>

                  {/* Habitaciones */}
                  {item.habitaciones.map((hab) => (
                    <div
                      key={hab.id}
                      className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3"
                    >
                      <div className="flex-1">
                        <h4 className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 ">
                          <House className="size-5 inline-block mr-1" />
                          {hab.nombre}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Precio: ${hab.precioFinal.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removerHabitacion(item.idHotel, hab.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        aria-label="Eliminar habitación"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}

                  {/* Paquetes */}
                  {item.paquetes.map((pack) => (
                    <div
                      key={pack.id}
                      className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3"
                    >
                      <div className="flex-1">
                        <h4 className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 ">
                          <Package className="size-5 inline-block mr-1" />
                          {pack.nombre}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Precio: ${pack.precioFinal.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removerPaquete(item.idHotel, pack.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        aria-label="Eliminar paquete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Pie del carrito */}
          {elementosCarrito.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-300">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  ${total.toFixed(2)}
                </span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                Proceder al Pago
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carrito;
