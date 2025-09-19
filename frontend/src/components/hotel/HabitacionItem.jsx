import { useMemo } from 'react';
import { Users, Home } from 'lucide-react';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { normalizarDescuento } from '@utils/pricingUtils';
import Counter from '@ui/Counter';

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
          <PriceTag
            precio={precioFinal}
            original={descuentoTemporada ? precioBase : undefined}
          />
        </div>
      </div>
    </article>
  );
}

export default HabitacionItem;
