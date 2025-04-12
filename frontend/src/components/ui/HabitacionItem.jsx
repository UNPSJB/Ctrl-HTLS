import { useState } from 'react';
import { RoomDetailsModal } from '../RoomDetailsModal';
import PriceTag from '../PriceTag';
import { useCarrito } from '../../context/CartContext';

const HabitacionItem = ({
  idHotel,
  habitacion,
  coeficiente,
  temporada,
  coeficienteHotel,
  isSelected,
  onSelect,
}) => {
  if (!habitacion) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarHabitacion, removerHabitacion } = useCarrito();

  const manejarSeleccion = () => {
    onSelect(habitacion.id);
    if (isSelected) {
      removerHabitacion(idHotel, habitacion.id);
    } else {
      // Al agregar, pasamos además la información de temporada y coeficiente
      agregarHabitacion(idHotel, habitacion.id, temporada, coeficienteHotel);
    }
  };

  const precioOriginal = habitacion.precio;

  return (
    <>
      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={manejarSeleccion}
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
          <PriceTag precio={precioOriginal} coeficiente={coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2"
            onClick={() => setMostrarModal(true)}
          >
            Más Detalles
          </button>
        </div>
      </div>

      {mostrarModal && (
        <RoomDetailsModal
          habitacion={habitacion}
          discountCoefficient={coeficiente}
          onClose={() => setMostrarModal(false)}
          onReserve={() => {
            manejarSeleccion();
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default HabitacionItem;
