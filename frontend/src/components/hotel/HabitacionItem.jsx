// src/components/hotel/HabitacionItem.jsx
import { useState } from 'react';
import RoomDetailsModal from './RoomDetailsModal';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { normalizarDescuento } from '@utils/pricingUtils';

/**
 * HabitacionItem
 * - Recibe habitacion en la forma plana que generamos en HotelCard:
 *   { id, nombre, capacidad, precio, piso, numero, tipo }
 *
 * - Comentarios en español; nombres de variables/archivos en inglés.
 */
function HabitacionItem({ hotelData, habitacion, isSelected, onSelect }) {
  if (!habitacion) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarHabitacion, removerHabitacion } = useCarrito();
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros ?? {};

  // Precio unitario por noche (puede ser null si la API no lo provee)
  const precioOriginalNoche = habitacion.precio ?? null;

  // Si la temporada del hotel es "alta", aplicamos el coeficiente SOLO para mostrar.
  const esAlta = hotelData?.temporada === 'alta';
  const descHotel = esAlta ? normalizarDescuento(hotelData?.coeficiente) : 0;
  const precioFinalNoche =
    precioOriginalNoche !== null
      ? Math.round(precioOriginalNoche * (1 - descHotel) * 100) / 100
      : null;

  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    // onSelect mantiene la UI local
    onSelect(habitacion.id);

    if (checked) {
      // Agregar la instancia al carrito: enviamos la forma que el carrito espera (id, nombre, precio, etc.)
      agregarHabitacion(
        hotelData,
        {
          id: habitacion.id,
          nombre: habitacion.nombre,
          capacidad: habitacion.capacidad,
          precio: habitacion.precio,
          piso: habitacion.piso,
          numero: habitacion.numero,
          tipo: habitacion.tipo,
        },
        { fechaInicio, fechaFin }
      );
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
              {habitacion.piso !== null && habitacion.numero !== null && (
                <span className="ml-2">
                  · Piso {habitacion.piso} · N° {habitacion.numero}
                </span>
              )}
            </p>
          </div>
        </header>

        <section className="flex justify-center">
          {/* Contador (si aplicara) */}
        </section>

        <footer className="flex flex-col items-end gap-1">
          {/* Si no hay precio mostramos "Consultar" */}
          {precioFinalNoche !== null ? (
            <PriceTag
              precio={precioFinalNoche}
              original={esAlta ? precioOriginalNoche : undefined}
            />
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Consultar precio
            </span>
          )}

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
              agregarHabitacion(
                hotelData,
                {
                  id: habitacion.id,
                  nombre: habitacion.nombre,
                  capacidad: habitacion.capacidad,
                  precio: habitacion.precio,
                  piso: habitacion.piso,
                  numero: habitacion.numero,
                  tipo: habitacion.tipo,
                },
                { fechaInicio, fechaFin }
              );
            }
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
}

export default HabitacionItem;
