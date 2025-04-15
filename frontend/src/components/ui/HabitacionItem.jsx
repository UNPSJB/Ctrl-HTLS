import { useState } from 'react';
import RoomDetailsModal from '@components/modals/RoomDetailsModal';
import PriceTag from '@components/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';

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
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros;

  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(habitacion.id);
    if (checked) {
      agregarHabitacion(idHotel, habitacion, fechaInicio, fechaFin);
    } else {
      removerHabitacion(idHotel, habitacion.id);
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
            if (!isSelected) {
              agregarHabitacion(
                idHotel,
                habitacion.id,
                temporada,
                coeficienteHotel,
                filtros.fechaInicio,
                filtros.fechaFin
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
