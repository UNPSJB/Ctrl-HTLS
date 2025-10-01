import { memo, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Home, Info } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import Counter from '@ui/Counter';
import RoomDetailsModal from './RoomDetailsModal';
import {
  roundToInteger,
  toNumber,
  calcSeasonalPrice,
} from '@utils/pricingUtils';

function HabitacionItem({
  hotelData = null,
  habitacionGroup,
  selectedIds = [],
  selectedIdsSet,
  onAdd,
  onRemove,
}) {
  const [showModal, setShowModal] = useState(false);

  // Instancias físicas de este grupo y disponibilidad
  const instances = Array.isArray(habitacionGroup.habitaciones)
    ? habitacionGroup.habitaciones
    : [];
  const maxAvailable = instances.length;

  // Set local de instancias para lookups O(1)
  const instanceIdsSet = useMemo(
    () => new Set(instances.map((i) => i.id)),
    [instances]
  );

  // Contar cuántas instancias de este grupo están seleccionadas
  const selectedCount = useMemo(() => {
    const ids = selectedIds || [];
    let count = 0;
    for (const id of ids) {
      if (instanceIdsSet.has(id)) count++;
    }
    return count;
  }, [selectedIds, instanceIdsSet]);

  // Precio base (del grupo). toNumber asegura que sea número aunque venga como string.
  const precioBase = toNumber(habitacionGroup.precio ?? 100);

  // ---- Lógica de temporada / precio final ----
  // Por defecto mostramos el precio redondeado
  let precioFinal = roundToInteger(precioBase);
  let precioOriginal = undefined;

  // Si existe temporada en el hotel, aplicamos la lógica de descuento (ejemplo: tipo 'alta')
  if (hotelData?.temporada) {
    const temporada = hotelData.temporada;
    const porcentajeRaw = temporada?.porcentaje ?? 0;
    const porcentaje = toNumber(porcentajeRaw);

    // Ejemplo: cuando temporada.tipo === 'alta' aplicamos un "precio con descuento"
    if (temporada?.tipo === 'alta' && porcentaje) {
      const precioConDescuento = calcSeasonalPrice(precioBase, porcentaje);
      precioFinal = roundToInteger(precioConDescuento);
      // Guardamos precio original para que PriceTag pueda mostrarlo tachado
      precioOriginal = roundToInteger(precioBase);
    } else {
      // si no es tipo 'alta' o no hay porcentaje, dejamos el precio base redondeado
      precioFinal = roundToInteger(precioBase);
    }
  }

  // Handlers para agregar/remover (no enviamos fechas por ahora)
  const handleIncrement = useCallback(() => {
    if (selectedCount >= maxAvailable) return;
    const selectedSet = selectedIdsSet ?? new Set(selectedIds ?? []);
    const instanciaParaAgregar = instances.find(
      (inst) => !selectedSet.has(inst.id)
    );
    if (!instanciaParaAgregar) return;

    const habitacionAAgregar = {
      ...instanciaParaAgregar,
      tipo: habitacionGroup.tipo,
      capacidad: habitacionGroup.capacidad,
      precio: precioBase,
      nombre: `${habitacionGroup.tipo} - ${instanciaParaAgregar.numero ?? ''}`,
    };

    onAdd?.(habitacionAAgregar);
  }, [
    selectedCount,
    maxAvailable,
    instances,
    selectedIdsSet,
    selectedIds,
    habitacionGroup,
    precioBase,
    onAdd,
  ]);

  const handleDecrement = useCallback(() => {
    if (selectedCount <= 0) return;
    const seleccionadasDelGrupo = (selectedIds || []).filter((id) =>
      instanceIdsSet.has(id)
    );
    const idARemover = seleccionadasDelGrupo[seleccionadasDelGrupo.length - 1];
    if (!idARemover) return;
    onRemove?.(idARemover);
  }, [selectedCount, selectedIds, instanceIdsSet, onRemove]);

  const handleShowDetails = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);
  const handleReserveFromModal = () => {
    setShowModal(false);
    handleIncrement();
  };

  return (
    <>
      <article className="grid grid-cols-4 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Columna 1: info del tipo */}
        <div className="col-span-2 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {habitacionGroup.tipo}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{habitacionGroup.capacidad ?? '—'}</span>
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

        {/* Contador */}
        <div className="flex justify-center">
          <Counter
            value={selectedCount}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            min={0}
            max={maxAvailable}
          />
        </div>

        {/* Precio: ahora pasamos precioFinal y original (si aplica) */}
        <div className="flex justify-end">
          <div className="text-right">
            <PriceTag precio={precioFinal} original={precioOriginal} />
          </div>
        </div>
      </article>

      {showModal &&
        createPortal(
          <RoomDetailsModal
            habitacion={{
              nombre: habitacionGroup.tipo,
              capacidad: habitacionGroup.capacidad,
              precio: precioBase,
              ...instances[0],
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
