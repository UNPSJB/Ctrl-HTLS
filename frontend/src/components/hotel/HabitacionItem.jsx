import { useMemo } from 'react';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { normalizarDescuento } from '@utils/pricingUtils';
import Counter from '@ui/Counter'; // Componente reutilizable de contador

function HabitacionItem({ hotelData, habitacionGroup, hotelInCart }) {
  if (!habitacionGroup) return null;

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

  // Precio representativo: toma la primera instancia con precio o fallback
  const precioBase =
    instances.find((i) => typeof i.precio === 'number')?.precio ??
    instances[0]?.precio ??
    100;

  // Aplicar coeficiente/temporada igual que antes
  const esTemporadaAlta = hotelData?.temporada === 'alta';
  const descuentoTemporada = esTemporadaAlta
    ? normalizarDescuento(hotelData?.coeficiente)
    : 0;
  const precioFinal =
    Math.round(precioBase * (1 - descuentoTemporada) * 100) / 100;

  // Cuando incrementamos, tomamos la primera instancia que NO esté en selectedIds
  const handleIncrement = () => {
    if (selectedCount >= maxAvailable) return;

    const instanciaParaAgregar = instances.find(
      (inst) => !selectedIds.includes(inst.id)
    );
    if (!instanciaParaAgregar) return;

    // metadatos útiles (tipo, capacidad, nombre) para facilitar renderizado en el carrito
    const habitacionAAgregar = {
      ...instanciaParaAgregar,
      tipo: habitacionGroup.tipo,
      capacidad: habitacionGroup.capacidad,
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

    removerHabitacion(hotelData.idHotel, idARemover);
  };

  return (
    <article className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      {/* Izquierda: info del tipo */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {habitacionGroup.tipo}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Capacidad: {habitacionGroup.capacidad ?? '—'} personas
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Disponibles: {maxAvailable}
          </span>
        </div>
      </div>

      {/* Centro: contador */}
      <div className="mx-4">
        <Counter
          value={selectedCount}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          min={0}
          max={maxAvailable}
        />
      </div>

      {/* Derecha: precio */}
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <PriceTag
            precio={precioFinal}
            original={descuentoTemporada ? precioBase : undefined}
          />
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            por noche (por habitación)
          </span>
        </div>
      </div>
    </article>
  );
}

export default HabitacionItem;
