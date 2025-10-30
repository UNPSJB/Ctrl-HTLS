import { memo } from 'react';
import { createPortal } from 'react-dom';
import { Users, Home, Info } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import Counter from '@ui/Counter';
import RoomDetailsModal from './RoomDetailsModal';
import { useHabitacionSelection } from '@hooks/useHabitacionSelection';

function HabitacionItem({ hotelData, habitacionTipo, onAdd, onRemove }) {
  const {
    tipo,
    capacidad,
    precio: precioBase,
    habitaciones: instanciasDisponibles,
  } = habitacionTipo;

  // Toda la lógica ahora reside en esta única línea
  const {
    showModal,
    selectedCount,
    precioFinal,
    precioOriginal,
    maxAvailable,
    handleIncrement,
    handleDecrement,
    handleShowDetails,
    handleCloseModal,
    handleReserveFromModal,
  } = useHabitacionSelection(hotelData, habitacionTipo, onAdd, onRemove);

  return (
    <>
      <article className="grid grid-cols-4 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        <div className="col-span-2 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {tipo}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{capacidad ?? '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Home className="h-4 w-4" />
              <span>{maxAvailable}</span>
            </div>
            <button
              onClick={handleShowDetails}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Info className="h-4 w-4" />
              <span>Detalles</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <Counter
            value={selectedCount}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            max={maxAvailable}
          />
        </div>

        <div className="flex justify-end">
          <PriceTag precio={precioFinal} original={precioOriginal} />
        </div>
      </article>

      {showModal &&
        createPortal(
          <RoomDetailsModal
            habitacion={{
              nombre: tipo,
              capacidad,
              precio: precioBase,
              ...instanciasDisponibles[0],
            }}
            temporada={hotelData?.temporada ?? null}
            onClose={handleCloseModal}
            onReserve={handleReserveFromModal}
          />,
          document.body
        )}
    </>
  );
}

export default memo(HabitacionItem);
