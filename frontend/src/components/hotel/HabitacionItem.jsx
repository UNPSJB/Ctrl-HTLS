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
import { useCarrito } from '@context/CarritoContext';
import useBookingDates from '@hooks/useBookingDates';

function HabitacionItem({
  hotelData = null,
  hotelId = null,
  habitacionGroup,
  selectedIds = [],
  selectedIdsSet = null,
  onAdd = null,
  onRemove = null,
}) {
  const [showModal, setShowModal] = useState(false);

  // Hook para obtener fechas normalizadas en ISO (o null) y nights si hace falta
  const { isoFechaInicio, isoFechaFin } = useBookingDates();

  // Carrito: fallback si no viene onAdd/onRemove desde el padre
  const carrito = useCarrito();
  const addRoomCtx = carrito?.addRoom ?? carrito?.agregarHabitacion;
  const removeRoomCtx = carrito?.removeRoom ?? carrito?.removerHabitacion;

  // Instancias físicas del grupo
  const instances = Array.isArray(habitacionGroup.habitaciones)
    ? habitacionGroup.habitaciones
    : [];
  const maxAvailable = instances.length;

  // Set local de instancias para búsquedas O(1)
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

  // Precio base (normalizar a número)
  const precioBase = toNumber(habitacionGroup.precio ?? 100);

  // Calcular precio final/original según temporada (si existe)
  const { precioFinal, precioOriginal } = useMemo(() => {
    let final = roundToInteger(precioBase);
    let original = undefined;

    if (hotelData?.temporada) {
      const temporada = hotelData.temporada;
      const porcentaje = toNumber(temporada?.porcentaje ?? 0);

      // Ejemplo: aplicar lógica cuando temporada.tipo === 'alta'
      if (temporada?.tipo === 'alta' && porcentaje) {
        const precioConDescuento = calcSeasonalPrice(precioBase, porcentaje);
        final = roundToInteger(precioConDescuento);
        original = roundToInteger(precioBase);
      }
    }

    return { precioFinal: final, precioOriginal: original };
  }, [precioBase, hotelData]);

  // Handler para agregar una habitación
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

    const fechas = { fechaInicio: isoFechaInicio, fechaFin: isoFechaFin };

    // Si el padre controla la selección, lo notificamos (recomendado)
    if (typeof onAdd === 'function') {
      onAdd(habitacionAAgregar, fechas);
      return;
    }

    // Fallback: usar API del contexto. soporta agregarHabitacion(hotelInfo, habitacion, fechas)
    if (typeof addRoomCtx === 'function') {
      try {
        // Si addRoomCtx es wrapper nuevo (hotelId, roomObj, fechas)
        if (carrito?.addRoom) {
          // wrapper nuevo
          carrito.addRoom(
            hotelId ?? hotelData?.hotelId,
            habitacionAAgregar,
            fechas
          );
        } else {
          // API antigua
          carrito.agregarHabitacion(
            {
              hotelId: hotelId ?? hotelData?.hotelId,
              nombre: hotelData?.nombre ?? null,
              temporada: hotelData?.temporada ?? null,
            },
            habitacionAAgregar,
            fechas
          );
        }
      } catch (err) {
        console.warn(
          'HabitacionItem: error agregando habitación via CarritoContext',
          err
        );
      }
      return;
    }

    console.warn(
      'HabitacionItem: no existe onAdd ni función de carrito conocida para agregar.'
    );
  }, [
    selectedCount,
    maxAvailable,
    instances,
    selectedIdsSet,
    selectedIds,
    habitacionGroup,
    precioBase,
    onAdd,
    addRoomCtx,
    carrito,
    hotelId,
    hotelData,
    isoFechaInicio,
    isoFechaFin,
  ]);

  // Handler para remover la última seleccionada de este grupo
  const handleDecrement = useCallback(() => {
    if (selectedCount <= 0) return;
    const seleccionadasDelGrupo = (selectedIds || []).filter((id) =>
      instanceIdsSet.has(id)
    );
    const idARemover = seleccionadasDelGrupo[seleccionadasDelGrupo.length - 1];
    if (!idARemover) return;

    // Si padre controla, delegamos
    if (typeof onRemove === 'function') {
      onRemove(idARemover);
      return;
    }

    // Fallback al contexto
    if (typeof removeRoomCtx === 'function') {
      try {
        if (carrito?.removeRoom) {
          carrito.removeRoom(hotelId ?? hotelData?.hotelId, idARemover);
        } else {
          carrito.removerHabitacion(hotelId ?? hotelData?.hotelId, idARemover);
        }
      } catch (err) {
        console.warn(
          'HabitacionItem: error removiendo habitación via CarritoContext',
          err
        );
      }
      return;
    }

    console.warn(
      'HabitacionItem: no existe onRemove ni función de carrito conocida para remover.'
    );
  }, [
    selectedCount,
    selectedIds,
    instanceIdsSet,
    onRemove,
    removeRoomCtx,
    carrito,
    hotelId,
    hotelData,
  ]);

  const handleShowDetails = (e) => {
    e?.stopPropagation();
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

        {/* Precio */}
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
