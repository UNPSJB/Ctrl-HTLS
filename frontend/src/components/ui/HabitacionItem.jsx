import { useState } from 'react';
import RoomDetailsModal from '@components/modals/RoomDetailsModal';
import PriceTag from '@components/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';

const HabitacionItem = ({ hotelData, habitacion, isSelected, onSelect }) => {
  if (!habitacion) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarHabitacion, removerHabitacion } = useCarrito();
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros;

  // Siempre mostrar el precio por una noche
  const precioPorNoche = habitacion.precio;

  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(habitacion.id);
    if (checked) {
      agregarHabitacion(hotelData, habitacion, { fechaInicio, fechaFin });
    } else {
      removerHabitacion(hotelData.idHotel, habitacion.id);
    }
  };

  return (
    <>
      <article
        aria-labelledby={`room-${habitacion.id}-title`}
        className="grid items-center border rounded-md px-6 py-4 bg-gray-50 dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 gap-10"
        style={{ gridTemplateColumns: '1fr auto auto' }}
      >
        {/* Encabezado: checkbox + información */}
        <header className="flex items-center gap-6">
          <input
            type="checkbox"
            id={`room-${habitacion.id}-checkbox`}
            checked={isSelected}
            onChange={manejarSeleccion}
            className="mt-1 w-5 h-5 cursor-pointer"
            aria-labelledby={`room-${habitacion.id}-title`}
          />
          <div className="flex flex-col gap-1">
            <h4
              id={`room-${habitacion.id}-title`}
              className="text-md font-semibold text-gray-800 dark:text-gray-200"
            >
              {habitacion.nombre}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Capacidad: {habitacion.capacidad} personas
            </p>
          </div>
        </header>

        {/* Sección: contador de cantidad */}
        <section className="flex justify-center">
          {/* Aquí iría tu componente de contador reutilizable */}
          {/* <Counter max={habitacion.capacidad} /> */}
        </section>

        {/* Pie de artículo: precio y botón de detalles */}
        <footer className="flex flex-col items-end gap-1">
          <PriceTag
            precio={precioPorNoche}
            coeficiente={hotelData.coeficiente}
          />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
            onClick={() => setMostrarModal(true)}
          >
            Más Detalles
          </button>
        </footer>
      </article>

      {mostrarModal && (
        <RoomDetailsModal
          habitacion={habitacion}
          coeficiente={hotelData.coeficiente}
          onClose={() => setMostrarModal(false)}
          onReserve={() => {
            if (!isSelected) {
              agregarHabitacion(hotelData, habitacion, {
                fechaInicio,
                fechaFin,
              });
            }
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default HabitacionItem;
