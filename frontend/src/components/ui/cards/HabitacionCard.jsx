import PriceTag from '@/components/PriceTag';
import { Users } from 'lucide-react';
import {
  calcularPrecioFinalHabitacion,
  calcularNoches,
} from '@utils/pricingUtils';

function HabitacionCard({ habitacion, porcentaje = 0 }) {
  if (!habitacion) return null;

  // noches entre fechas (al menos 1)
  const noches = calcularNoches(habitacion.fechaInicio, habitacion.fechaFin);

  // Datos finales aplicando descuento del hotel (si corresponde)
  const infoFinal = calcularPrecioFinalHabitacion({
    habitacion: {
      ...habitacion,
      // aseguramos que la función tenga acceso a las fechas si las usa
      fechaInicio: habitacion.fechaInicio,
      fechaFin: habitacion.fechaFin,
    },
    descuentoHotel: porcentaje ?? 0,
  });

  // Precio por noche original (habitacion.precio) — usamos el dato original si está,
  // pero también podemos obtenerlo de base.originalPorUnidad / noches
  const perNightOriginal = Number(habitacion.precio ?? 0);

  // Precio por noche final: dividimos el total final por qty y noches
  const qty = Math.max(1, Math.floor(Number(infoFinal.qty ?? 1)));
  const nights = Math.max(1, Math.floor(Number(infoFinal.noches ?? noches)));
  const perNightFinal =
    Math.round(((infoFinal.final ?? 0) / qty / nights) * 100) / 100;

  // Formatear fechas a dd/mm/aaaa (defensivo)
  const formatFecha = (fecha) => {
    try {
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      return `${dia}/${mes}/${anio}`;
    } catch {
      return '';
    }
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

        {/* Mostrar precio por noche: final con original tachado si corresponde */}
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
          {formatFecha(habitacion.fechaInicio)} {' - '}
          {formatFecha(habitacion.fechaFin)} {' - '} ( {noches} noche
          {noches > 1 ? 's' : ''} )
        </div>

        {/* Mostrar total (final) para el rango de fechas */}
        <PriceTag
          precio={infoFinal.final ?? 0}
          original={
            infoFinal.final < infoFinal.original
              ? infoFinal.original
              : undefined
          }
        />
      </div>
    </div>
  );
}

export default HabitacionCard;
