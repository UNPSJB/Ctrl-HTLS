import PriceTag from '@/components/ui/PriceTag';
import { Users } from 'lucide-react';
import {
  calcularPrecioFinalHabitacion,
  calcularNoches,
} from '@utils/pricingUtils';
import { useBusqueda } from '@context/BusquedaContext';

function HabitacionCard({ habitacion, porcentaje = 0 }) {
  if (!habitacion) return null;

  const { filtros } = useBusqueda();

  // Helper: convierte "" / null / undefined / "   " -> null
  const safeValue = (v) =>
    v !== undefined && v !== null && String(v).trim() !== ''
      ? String(v).trim()
      : null;

  // Prioridad de fechas: 1) habitacion (si tiene valor no vacío) 2) filtros del buscador
  const fechaInicio =
    safeValue(habitacion.fechaInicio) || safeValue(filtros?.fechaInicio);
  const fechaFin =
    safeValue(habitacion.fechaFin) || safeValue(filtros?.fechaFin);

  // noches desde fechas resueltas (al menos 1)
  const nochesFromDates = calcularNoches(fechaInicio, fechaFin);

  // Calculo final usando las fechas resueltas
  const infoFinal = calcularPrecioFinalHabitacion({
    habitacion: { ...habitacion, fechaInicio, fechaFin },
    descuentoHotel: porcentaje ?? 0,
  });

  // Qty y nights: preferimos los valores devueltos por util si están
  const qty = Math.max(1, Math.floor(Number(infoFinal.qty ?? 1)));
  const nights = Math.max(
    1,
    Math.floor(Number(infoFinal.noches ?? nochesFromDates))
  );

  const originalTotal = Number(infoFinal.original ?? 0);
  const finalTotal = Number(infoFinal.final ?? 0);

  const perNightOriginal =
    nights > 0 && qty > 0
      ? Math.round((originalTotal / qty / nights) * 100) / 100
      : Number(habitacion.precio ?? 0);

  const perNightFinal =
    nights > 0 && qty > 0
      ? Math.round((finalTotal / qty / nights) * 100) / 100
      : perNightOriginal;

  // Formateo defensivo de fechas
  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    if (!Number.isFinite(d.getTime())) return '-';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {habitacion.nombre}
          </h3>
          <div className="mx-4 border-l border-gray-300 dark:border-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Capacidad: {habitacion.capacidad} personas
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

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatFecha(fechaInicio)} {' - '}
          {formatFecha(fechaFin)} {' - '} ( {nights} noche
          {nights > 1 ? 's' : ''} )
        </div>

        {/* Total final para el rango de fechas */}
        <PriceTag
          precio={finalTotal}
          original={finalTotal < originalTotal ? originalTotal : undefined}
        />
      </div>
    </div>
  );
}

export default HabitacionCard;
