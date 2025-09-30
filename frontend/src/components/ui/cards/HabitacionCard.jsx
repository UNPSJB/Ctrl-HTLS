import PriceTag from '@ui/PriceTag';
import { Users } from 'lucide-react';
import pricingUtils from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';
import { useBusqueda } from '@context/BusquedaContext';

// Destructuramos las funciones necesarias
const { calcRoomInstanceTotal } = pricingUtils;
// Importamos la utilidad de fecha y noches, y la función de normalización
const { nightsBetween, formatFecha, normalizeDateValue } = dateUtils;

function HabitacionCard({ habitacion, porcentaje = 0 }) {
  if (!habitacion) return null;

  const { filtros } = useBusqueda();

  // Lógica de fechas usando la utilidad centralizada normalizeDateValue.
  // Prioridad: 1) fecha de la habitación 2) fecha de los filtros.

  const roomFechaInicio = normalizeDateValue(habitacion.fechaInicio);
  const filterFechaInicio = normalizeDateValue(filtros?.fechaInicio);
  const fechaInicio = roomFechaInicio || filterFechaInicio;

  const roomFechaFin = normalizeDateValue(habitacion.fechaFin);
  const filterFechaFin = normalizeDateValue(filtros?.fechaFin);
  const fechaFin = roomFechaFin || filterFechaFin;

  // noches desde fechas resueltas (al menos 1)
  const nights = nightsBetween(fechaInicio, fechaFin);

  // Calculamos el precio usando la utilidad centralizada:
  const infoFinal = calcRoomInstanceTotal({
    roomInstance: { price: habitacion.precio ?? habitacion.price ?? 0 },
    nights: nights,
    qty: habitacion.qty ?? 1,
    hotelSeasonDiscount: porcentaje,
  });

  // Nombres de variables finales
  const perNightOriginal = infoFinal.original / infoFinal.nights;
  const perNightFinal = infoFinal.final / infoFinal.nights;

  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {habitacion.nombre}
          </h3>
          <div className="mx-4 border-l border-gray-300 dark:border-gray-600" />
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4" />
            Capacidad: {habitacion.capacidad ?? habitacion.capacity ?? '-'}{' '}
            personas
          </p>
        </div>

        {/* Precio por noche: final con original tachado si corresponde */}
        <PriceTag
          precio={perNightFinal}
          original={
            perNightFinal < perNightOriginal ? perNightOriginal : undefined
          }
        />
      </div>

      <hr className="my-4 border-gray-300 dark:border-gray-600" />

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatFecha(fechaInicio)} {' - '}
          {formatFecha(fechaFin)} {' - '} ( {nights} noche
          {nights > 1 ? 's' : ''})
        </div>
        <button
          // onClick aquí debe manejar la adición al carrito o selección temporal
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Seleccionar
        </button>
      </div>
    </div>
  );
}

export default HabitacionCard;
