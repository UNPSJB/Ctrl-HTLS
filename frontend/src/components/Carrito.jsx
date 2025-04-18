import { X, Trash2, CreditCard, House, Package } from 'lucide-react';
import { useCarrito } from '@context/CarritoContext';
import Temporada from './Temporada';
import { useNavigate } from 'react-router-dom';

const Carrito = ({ isOpen, onClose }) => {
  const { carrito, removerHabitacion, removerPaquete } = useCarrito();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Función para calcular el precio con descuento de habitación
  const getPrecioHabitacion = (hab, hotel) => {
    if (hotel.temporada === 'alta' && hotel.coeficiente) {
      return hab.precio * (1 - hotel.coeficiente);
    }
    return hab.precio;
  };

  // Función para calcular el precio con descuento de paquete
  const getPrecioPaquete = (pack, hotel) => {
    let precioBase = 0;
    if (pack.habitaciones && Array.isArray(pack.habitaciones)) {
      precioBase =
        pack.habitaciones.reduce((acum, hab) => acum + hab.precio, 0) *
        (1 - (pack.descuento || 0) / 100) *
        (pack.noches || 1);
    }
    if (hotel.temporada === 'alta' && hotel.coeficiente) {
      return precioBase * (1 - hotel.coeficiente);
    }
    return precioBase;
  };

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
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {carrito.hoteles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No hay reservas en el carrito
                </p>
              </div>
            ) : (
              carrito.hoteles.map((hotel, hotelIdx) => (
                <div key={hotel.idHotel || hotelIdx} className="mb-6">
                  {/* Cabecera del hotel */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-4">
                      {hotel.nombre}
                      {hotel.temporada === 'alta' && (
                        <Temporada porcentaje={hotel.coeficiente} />
                      )}
                    </h3>
                  </div>

                  {/* Habitaciones */}
                  {hotel.habitaciones.map((hab, habIdx) => {
                    const precioFinal = getPrecioHabitacion(hab, hotel);
                    return (
                      <div
                        key={hab.id || habIdx}
                        className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3"
                      >
                        <div className="flex-1">
                          <h4 className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100">
                            <House className="size-5 inline-block mr-1" />
                            {hab.nombre}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Precio: ${precioFinal.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            removerHabitacion(hotel.idHotel, hab.id)
                          }
                          className="w-8 h-8 aspect-square flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          aria-label="Eliminar habitación"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Paquetes */}
                  {hotel.paquetes.map((pack, packIdx) => {
                    const precioFinal = getPrecioPaquete(pack, hotel);
                    return (
                      <div
                        key={pack.id || packIdx}
                        className="flex gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3"
                      >
                        <div className="flex-1">
                          <h4 className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100">
                            <Package className="size-5 inline-block mr-1" />
                            {pack.nombre}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Precio: ${precioFinal.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removerPaquete(hotel.idHotel, pack.id)}
                          className="w-8 h-8 aspect-square flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          aria-label="Eliminar paquete"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Botón para ir a reservar/pagar */}
          {carrito.hoteles.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                onClick={() => {
                  onClose();
                  navigate('/reserva');
                }}
              >
                <CreditCard className="w-5 h-5" />
                Reservar / Pagar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carrito;
