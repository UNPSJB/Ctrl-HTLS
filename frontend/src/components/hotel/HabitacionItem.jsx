import { memo, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Home, Info } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import Counter from '@ui/Counter';
import RoomDetailsModal from './RoomDetailsModal';
import { calcSeasonalPrice } from '@utils/pricingUtils';
import { useCarrito } from '@context/CarritoContext';
import useBookingDates from '@hooks/useBookingDates';

function HabitacionItem({ hotelData, habitacionTipo, onAdd, onRemove }) {
  const [showModal, setShowModal] = useState(false);
  const { isoFechaInicio, isoFechaFin } = useBookingDates();
  const { carrito } = useCarrito();

  // Desestructuramos la prop `habitacionTipo` que ya viene con la estructura limpia
  const {
    tipo,
    capacidad,
    precio: precioBase,
    habitaciones: instanciasDisponibles,
  } = habitacionTipo;

  const maxAvailable = instanciasDisponibles.length;

  const hotelEnCarrito = useMemo(() => {
    return carrito.hoteles.find((h) => h.hotelId === hotelData?.hotelId);
  }, [carrito.hoteles, hotelData?.hotelId]);

  const selectedCount = useMemo(() => {
    if (!hotelEnCarrito) return 0;
    const idsEnCarrito = new Set(hotelEnCarrito.habitaciones.map((h) => h.id));
    return instanciasDisponibles.filter((inst) => idsEnCarrito.has(inst.id))
      .length;
  }, [hotelEnCarrito, instanciasDisponibles]);

  const { precioFinal, precioOriginal } = useMemo(() => {
    const final = hotelData?.temporada
      ? calcSeasonalPrice(precioBase, hotelData.temporada.porcentaje)
      : precioBase;
    return { precioFinal: final, precioOriginal: precioBase };
  }, [precioBase, hotelData]);

  const handleIncrement = useCallback(() => {
    if (selectedCount >= maxAvailable || !onAdd) return;

    const idsEnCarrito = new Set(
      hotelEnCarrito?.habitaciones.map((h) => h.id) || []
    );
    const instanciaParaAgregar = instanciasDisponibles.find(
      (inst) => !idsEnCarrito.has(inst.id)
    );

    if (!instanciaParaAgregar) return;

    const habitacionCompleta = {
      ...instanciaParaAgregar,
      tipo,
      capacidad,
      precio: precioBase,
      nombre: `${tipo} - ${instanciaParaAgregar.numero ?? ''}`,
    };

    const fechas = { fechaInicio: isoFechaInicio, fechaFin: isoFechaFin };
    onAdd(habitacionCompleta, fechas);
  }, [
    selectedCount,
    maxAvailable,
    instanciasDisponibles,
    hotelEnCarrito,
    tipo,
    capacidad,
    precioBase,
    onAdd,
    isoFechaInicio,
    isoFechaFin,
  ]);

  const handleDecrement = useCallback(() => {
    if (selectedCount <= 0 || !onRemove) return;

    const idsEnCarrito = new Set(
      hotelEnCarrito?.habitaciones.map((h) => h.id) || []
    );
    const instanciasSeleccionadas = instanciasDisponibles.filter((inst) =>
      idsEnCarrito.has(inst.id)
    );

    if (instanciasSeleccionadas.length > 0) {
      const idARemover =
        instanciasSeleccionadas[instanciasSeleccionadas.length - 1].id;
      onRemove(idARemover);
    }
  }, [selectedCount, onRemove, hotelEnCarrito, instanciasDisponibles]);

  const handleShowDetails = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleReserveFromModal = () => {
    setShowModal(false);
    handleIncrement();
  };

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
            min={0}
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
