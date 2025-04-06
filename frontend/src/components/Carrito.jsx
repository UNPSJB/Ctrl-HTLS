import { X, Trash2, CreditCard } from 'lucide-react';

const Carrito = ({ isOpen, onClose }) => {
  // Datos simulados - En una app real vendrían de un contexto o estado global
  const cartItems = [
    {
      id: 1,
      name: 'Habitación Deluxe',
      price: 200,
      image:
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=200&auto=format&fit=crop',
      nights: 2,
      dates: 'Mar 15 - Mar 17, 2024',
    },
    {
      id: 2,
      name: 'Suite Ejecutiva',
      price: 300,
      image:
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=200&auto=format&fit=crop',
      nights: 1,
      dates: 'Mar 20 - Mar 21, 2024',
    },
  ];

  if (!isOpen) return null;

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.nights,
    0
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Fondo semi-transparente */}
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
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No hay reservas en el carrito
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.dates}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ${item.price} × {item.nights}{' '}
                          {item.nights === 1 ? 'noche' : 'noches'}
                        </p>
                        <button
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie del carrito */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-300">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  ${total}
                </span>
              </div>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-medium hover:from-blue-700 hover:to-blue-600 transition-colors flex items-center justify-center gap-2">
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
