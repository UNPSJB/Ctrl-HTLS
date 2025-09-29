import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Home, Info } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { normalizeDiscount } from '@utils/pricingUtils';
import Counter from '@ui/Counter';
import RoomDetailsModal from './RoomDetailsModal';

function HabitacionItem({ hotelData, habitacionGroup, hotelInCart }) {
  if (!habitacionGroup) return null;

  const [showModal, setShowModal] = useState(false);

  const { agregarHabitacion, removerHabitacion } = useCarrito();
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros ?? {};

  const instances = Array.isArray(habitacionGroup.instances)
    ? habitacionGroup.instances
    : [];
  const maxAvailable = instances.length;

  // IDs seleccionadas en el carrito para este hotel (si existe)
  const selectedIds =
    hotelInCart?.habitaciones?.map((h) => h.id).filter(Boolean) ?? [];

  // Cuántas instancias de este grupo están seleccionadas
  const selectedCount = useMemo(() => {
    return selectedIds.filter((id) => instances.some((inst) => inst.id === id))
      .length;
  }, [selectedIds, instances]);

  // Precio base viene del grupo (precio del tipo)
  const precioBase = habitacionGroup.precio ?? 100;

  // Calcular precio según temporada (si existe)
  let precioFinal = precioBase;
  let precioOriginal = undefined;

  if (hotelData?.temporada) {
    const porcentaje = normalizeDiscount(hotelData.temporada.porcentaje);

    // Aquí asumimos que temporada.tipo puede ser 'alta' o 'baja'.
    // La lógica actual aplica un descuento en ambos casos (si así lo define negocio).
    if (
      hotelData.temporada.tipo === 'alta' ||
      hotelData.temporada.tipo === 'baja'
    ) {
      precioFinal = Math.round(precioBase * (1 - porcentaje) * 100) / 100;
      precioOriginal = precioBase;
    }
  }

  // Agregar: toma la primera instancia disponible que no esté ya seleccionada
  const handleIncrement = () => {
    if (selectedCount >= maxAvailable) return;

    const instanciaParaAgregar = instances.find(
      (inst) => !selectedIds.includes(inst.id)
    );
    if (!instanciaParaAgregar) return;

    const habitacionAAgregar = {
      ...instanciaParaAgregar,
      tipo: habitacionGroup.tipo,
      capacidad: habitacionGroup.capacidad,
      precio: precioBase,
      nombre: `${habitacionGroup.tipo} - ${instanciaParaAgregar.numero ?? ''}`,
    };

    // Asumimos API del carrito en español (agregarHabitacion)
    if (typeof agregarHabitacion === 'function') {
      agregarHabitacion(hotelData, habitacionAAgregar, {
        fechaInicio,
        fechaFin,
      });
    } else {
      console.warn('useCarrito no expone agregarHabitacion');
    }
  };

  // Remover: elimina la última instancia seleccionada de este grupo
  const handleDecrement = () => {
    if (selectedCount <= 0) return;

    const seleccionadasDelGrupo = selectedIds.filter((id) =>
      instances.some((inst) => inst.id === id)
    );
    const idARemover = seleccionadasDelGrupo[seleccionadasDelGrupo.length - 1];
    if (!idARemover) return;

    if (typeof removerHabitacion === 'function') {
      removerHabitacion(hotelData.hotelId, idARemover);
    } else {
      console.warn('useCarrito no expone removerHabitacion');
    }
  };

  const handleShowDetails = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleReserveFromModal = () => {
    setShowModal(false);
    handleIncrement();
  };

  return (
    <>
      <article className="grid grid-cols-4 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Columna 1: info del tipo */}
        <div className="col-span-2 flex items-center gap-4">
          <div className="flex gap-4">
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
              className="flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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

      {/* Modal: render en body */}
      {showModal &&
        createPortal(
          <RoomDetailsModal
            habitacion={{
              nombre: habitacionGroup.tipo,
              capacidad: habitacionGroup.capacidad,
              precio: precioBase,
              // se pasa la primera instancia como ejemplo (si existe)
              ...instances[0],
            }}
            temporada={hotelData?.temporada}
            onClose={handleCloseModal}
            onReserve={handleReserveFromModal}
          />,
          document.body
        )}
    </>
  );
}

export default HabitacionItem;
