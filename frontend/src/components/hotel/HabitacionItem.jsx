import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Home, Info } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { normalizarDescuento } from '@utils/pricingUtils';
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

  // Lista de ids ya seleccionados en el carrito para este hotel (si existe)
  const selectedIds =
    hotelInCart?.habitaciones?.map((h) => h.id).filter(Boolean) ?? [];

  // Contar cuántas de las instancias pertenecientes a este grupo están en el carrito
  const selectedCount = useMemo(() => {
    return selectedIds.filter((id) => instances.some((inst) => inst.id === id))
      .length;
  }, [selectedIds, instances]);

  // CORREGIDO: El precio ahora viene del grupo, no de las instancias individuales
  const precioBase = habitacionGroup.precio ?? 100;

  // Calcular precio según temporada
  let precioFinal = precioBase;
  let precioOriginal = undefined;

  if (hotelData?.temporada) {
    const porcentaje = normalizarDescuento(hotelData.temporada.porcentaje);

    if (hotelData.temporada.tipo === 'alta') {
      // Temporada alta: precio disminuye (descuento)
      precioFinal = Math.round(precioBase * (1 - porcentaje) * 100) / 100;
      precioOriginal = precioBase;
    } else if (hotelData.temporada.tipo === 'baja') {
      // Temporada baja: precio disminuye (descuento)
      precioFinal = Math.round(precioBase * (1 - porcentaje) * 100) / 100;
      precioOriginal = precioBase;
    }
  }

  // Cuando incrementamos, tomamos la primera instancia que NO esté en selectedIds
  const handleIncrement = () => {
    if (selectedCount >= maxAvailable) return;

    const instanciaParaAgregar = instances.find(
      (inst) => !selectedIds.includes(inst.id)
    );
    if (!instanciaParaAgregar) return;

    // metadatos útiles (tipo, capacidad, nombre, precio) para facilitar renderizado en el carrito
    const habitacionAAgregar = {
      ...instanciaParaAgregar,
      tipo: habitacionGroup.tipo,
      capacidad: habitacionGroup.capacidad,
      precio: precioBase, // Agregamos el precio del grupo
      nombre: `${habitacionGroup.tipo} - ${instanciaParaAgregar.numero ?? ''}`,
    };

    agregarHabitacion(hotelData, habitacionAAgregar, { fechaInicio, fechaFin });
  };

  // Cuando decrementamos, removemos una de las instancias seleccionadas (ej: la última)
  const handleDecrement = () => {
    if (selectedCount <= 0) return;

    // obtener ids seleccionados que pertenezcan a este grupo
    const seleccionadasDelGrupo = selectedIds.filter((id) =>
      instances.some((inst) => inst.id === id)
    );
    const idARemover = seleccionadasDelGrupo[seleccionadasDelGrupo.length - 1];
    if (!idARemover) return;

    removerHabitacion(hotelData.hotelId, idARemover);
  };

  const handleShowDetails = (e) => {
    e.stopPropagation(); // Evita que se active el hover de la card padre
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleReserveFromModal = () => {
    setShowModal(false);
    // Agregar habitación igual que el increment
    handleIncrement();
  };

  return (
    <>
      <article className="grid grid-cols-4 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Columna 1: info del tipo (ocupa 2 espacios) */}
        <div className="col-span-2 flex items-center gap-4">
          <div className="flex gap-4">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {habitacionGroup.tipo}
            </div>

            {/* Capacidad con icono */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{habitacionGroup.capacidad ?? '—'}</span>
            </div>

            {/* Disponibilidad con icono */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Home className="h-4 w-4" />
              <span>{maxAvailable}</span>
            </div>

            {/* Botón de detalles */}
            <button
              onClick={handleShowDetails}
              className="flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Info className="h-4 w-4" />
              <span>Detalles</span>
            </button>
          </div>
        </div>

        {/* Columna 2: contador */}
        <div className="flex justify-center">
          <Counter
            value={selectedCount}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            min={0}
            max={maxAvailable}
          />
        </div>

        {/* Columna 3: precio */}
        <div className="flex justify-end">
          <div className="text-right">
            <PriceTag precio={precioFinal} original={precioOriginal} />
          </div>
        </div>
      </article>

      {/* Modal renderizado directamente en el body usando portal */}
      {showModal &&
        createPortal(
          <RoomDetailsModal
            habitacion={{
              nombre: habitacionGroup.tipo,
              capacidad: habitacionGroup.capacidad,
              precio: precioBase,
              // Agregar más datos si están disponibles en instances
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
