import { useState } from 'react';
import { RoomDetailsModal } from '../RoomDetailsModal';

const HabitacionItem = ({ habitacion, coeficiente, isSelected, onSelect }) => {
  if (!habitacion) return null;

  // Estado para controlar el modal
  const [showModal, setShowModal] = useState(false);

  // Precio original de la habitación
  const originalPrice = habitacion.precio;
  // Calcular el precio con descuento solo si el coeficiente es distinto a 1.
  // Si coeficiente es 1, no se aplica descuento y se muestra el precio original.
  const discountPrice =
    coeficiente !== 1
      ? originalPrice - originalPrice * coeficiente
      : originalPrice;

  return (
    <>
      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(habitacion.nombre)}
          className="w-5 h-5"
        />
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {habitacion.nombre}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Capacidad: {habitacion.capacidad} personas
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          {coeficiente !== 1 ? (
            // Si se aplica descuento, se muestran ambos precios:
            // - El precio con descuento en verde.
            // - El precio original tachado.
            <div className="flex items-center gap-2">
              <p className="text-md font-bold text-green-600 dark:text-green-400">
                ${discountPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </p>
            </div>
          ) : (
            // Si no hay descuento, se muestra el precio normal.
            <p className="text-md font-bold text-gray-800 dark:text-gray-200">
              ${originalPrice.toFixed(2)}
            </p>
          )}
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2"
            onClick={() => setShowModal(true)} // Activa el modal al hacer clic
          >
            Más Detalles
          </button>
        </div>
      </div>

      {/* Renderiza el modal si está activo */}
      {showModal && (
        <RoomDetailsModal
          habitacion={habitacion}
          coeficiente={coeficiente}
          onClose={() => setShowModal(false)}
          onReserve={(id) => console.log('Reservando habitación con ID:', id)}
        />
      )}
    </>
  );
};

export default HabitacionItem;
