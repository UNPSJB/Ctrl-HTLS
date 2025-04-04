import { useState } from 'react';
import { RoomDetailsModal } from '../RoomDetailsModal';
import PriceTag from '../PriceTag';

const HabitacionItem = ({ habitacion, coeficiente, isSelected, onSelect }) => {
  if (!habitacion) return null;

  const [showModal, setShowModal] = useState(false);
  const originalPrice = habitacion.precio;

  return (
    <>
      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(habitacion.nombre)}
          className="w-5 h-5 cursor-pointer"
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
          <PriceTag precio={originalPrice} coeficiente={coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2"
            onClick={() => setShowModal(true)}
          >
            Más Detalles
          </button>
        </div>
      </div>

      {showModal && (
        <RoomDetailsModal
          habitacion={habitacion}
          discountCoefficient={coeficiente}
          onClose={() => setShowModal(false)}
          onReserve={() => {
            onSelect(habitacion.nombre); // Selecciona la habitación al reservar
            setShowModal(false); // Cierra el modal después de seleccionar
          }}
        />
      )}
    </>
  );
};

export default HabitacionItem;
