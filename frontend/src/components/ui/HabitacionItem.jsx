import { useState, useEffect } from 'react';
import RoomDetailsModal from '@components/modals/RoomDetailsModal';
import Contador from '@ui/Contador';
import PriceTag from '@components/PriceTag';
import { useCarrito } from '@context/CarritoContext';

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
  const [cantidad, setCantidad] = useState(0);
  const { agregarHabitacion, removerHabitacion } = useCarrito();

  // Ajustamos la cantidad a 0 cuando la habitación se deselecciona
  useEffect(() => {
    if (!isSelected) setCantidad(0);
  }, [isSelected]);

  // Se modifica manejarSeleccion para que reciba el evento y determine si el checkbox está marcado
  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(habitacion.id);
    if (checked) {
      // Si se marca el checkbox, se agrega la habitación al contexto
      agregarHabitacion(idHotel, habitacion.id, temporada, coeficienteHotel);
      setCantidad(1);
    } else {
      // Si se desmarca, se remueve del contexto y se reinicia la cantidad
      removerHabitacion(idHotel, habitacion.id);
      setCantidad(0);
    }
  };

  const precioOriginal = habitacion.precio;

  return (
    <>
      <div
        className="grid items-center border rounded-md px-6 py-4 bg-gray-50 dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 gap-10"
        style={{
          gridTemplateColumns: '1fr auto auto',
        }}
      >
        {/* Columna 1: Checkbox + Info habitación */}
        <div className="flex items-center gap-6">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={manejarSeleccion}
            className="mt-1 w-5 h-5 cursor-pointer"
          />
          <div className="flex flex-col gap-1">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
              {habitacion.nombre}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Capacidad: {habitacion.capacidad} personas
            </p>
          </div>
        </div>

        {/* Columna 2: Contador */}
        <Contador
          initial={cantidad}
          max={5}
          onChange={(nuevaCantidad) => {
            setCantidad(nuevaCantidad);
            if (nuevaCantidad === 0 && isSelected) {
              // Si el contador llega a 0, se deselecciona la habitación
              removerHabitacion(idHotel, habitacion.id);
            } else if (nuevaCantidad > 0 && !isSelected) {
              // Si se aumenta la cantidad y la habitación no está seleccionada, se agrega al contexto
              agregarHabitacion(
                idHotel,
                habitacion.id,
                temporada,
                coeficienteHotel
              );
            }
            // Puedes agregar aquí la lógica para actualizar la cantidad en el contexto si es necesario
          }}
        />

        {/* Columna 3: Precio + Más detalles */}
        <div className="flex flex-col items-end gap-1">
          <PriceTag precio={precioOriginal} coeficiente={coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
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
            // Al reservar desde el modal se asegura la selección
            if (!isSelected) {
              agregarHabitacion(
                idHotel,
                habitacion.id,
                temporada,
                coeficienteHotel
              );
            }
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default HabitacionItem;
