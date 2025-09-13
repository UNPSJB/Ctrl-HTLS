// src/components/hotel/HabitacionItem.jsx
import { useState } from 'react';
import PriceTag from '@ui/PriceTag';
import RoomDetailsModal from './RoomDetailsModal';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { normalizarDescuento } from '@utils/pricingUtils';

function HabitacionItem({ hotelData, habitacion, isSelected, onSelect }) {
  if (!habitacion) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarHabitacion, removerHabitacion } = useCarrito();
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros ?? {};

  // Calcular precio con descuento de temporada
  const precioOriginal = habitacion.precio ?? 100; // Precio base por defecto si no viene
  const esTemporadaAlta = hotelData?.temporada === 'alta';
  const descuentoTemporada = esTemporadaAlta
    ? normalizarDescuento(hotelData?.coeficiente)
    : 0;
  const precioFinal =
    Math.round(precioOriginal * (1 - descuentoTemporada) * 100) / 100;

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
      <article className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Checkbox y datos de la habitación */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id={`room-${habitacion.id}`}
            checked={isSelected}
            onChange={manejarSeleccion}
            className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          />

          <div className="flex flex-col">
            <label
              htmlFor={`room-${habitacion.id}`}
              className="cursor-pointer text-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              {habitacion.nombre}
            </label>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Capacidad: {habitacion.capacidad} personas
            </span>
          </div>
        </div>

        {/* Precio y botón de detalles */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <PriceTag
              precio={precioFinal}
              original={esTemporadaAlta ? precioOriginal : undefined}
            />
            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
              por noche
            </span>
          </div>

          <button
            onClick={() => setMostrarModal(true)}
            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Ver detalles
          </button>
        </div>
      </article>

      {/* Modal de detalles */}
      {mostrarModal && (
        <RoomDetailsModal
          habitacion={habitacion}
          coeficiente={hotelData.coeficiente}
          onClose={() => setMostrarModal(false)}
          onReserve={() => {
            if (!isSelected) {
              onSelect(habitacion.id);
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
}

export default HabitacionItem;
