import PriceTag from '@/components/PriceTag';
import { Users } from 'lucide-react';
import {
  calcularBasePaquete,
  calcularPrecioFinalPaquete,
  calcularNoches,
} from '@utils/pricingUtils';

function PaqueteCard({ paquete, porcentaje = 0 }) {
  if (!paquete) return null;

  // noches entre fechas (al menos 1)
  const noches = calcularNoches(paquete.fechaInicio, paquete.fechaFin);

  // Datos base: suma precios por noche y noches
  const base = calcularBasePaquete(paquete);
  // base: { originalPorPaquete, noches, sumaPorNoche }

  // Precio final aplicando descuento del paquete y del hotel (si corresponde)
  const infoFinal = calcularPrecioFinalPaquete({
    paquete: {
      ...paquete,
      // asegurar que las fechas estén presentes si las usa la función
      fechaInicio: paquete.fechaInicio,
      fechaFin: paquete.fechaFin,
    },
    descuentoHotel: porcentaje ?? 0,
  });
  // infoFinal: { original, final, descuento, noches, qty }

  // Precio base mostrado por noche (suma de precios por noche sin descuentos)
  const precioBasePorNoche = base.sumaPorNoche ?? 0;

  // Precio final total para todo el paquete (incluye noches y descuentos)
  const precioTotalFinal = infoFinal.final ?? 0;
  const precioTotalOriginal = infoFinal.original ?? precioTotalFinal;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {paquete.nombre}
          </h3>
          <div className="mx-4 border-l border-gray-300 dark:border-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Incluye {paquete.habitaciones?.length ?? 0} habitación
            {paquete.habitaciones?.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Precio base por noche (sin aplicar noches ni descuentos) */}
        <PriceTag precio={precioBasePorNoche} />
      </div>

      <hr className="my-4 border-gray-300 dark:border-gray-600" />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Noches: {noches} | Descuento: {paquete.descuento ?? 0}%
        </div>

        {/* Precio final: total para el paquete considerando noches y descuentos */}
        <PriceTag
          precio={precioTotalFinal}
          original={
            precioTotalOriginal > precioTotalFinal
              ? precioTotalOriginal
              : undefined
          }
        />
      </div>

      <div className="mt-3">
        <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">
          Habitaciones Incluidas:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
          {(paquete.habitaciones || []).map((hab) => (
            <li key={hab.id} className="flex flex-col gap-1">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {hab.nombre} ({hab.capacidad} personas)
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ${hab.precio} por noche
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PaqueteCard;
