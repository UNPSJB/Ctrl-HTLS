import PriceTag from '@/components/PriceTag';
import { Users } from 'lucide-react';
import { calcularPrecioPaquete, calcularNoches } from '@utils/pricingUtils';

const PaqueteCard = ({ paquete, porcentaje = 1 }) => {
  const noches = calcularNoches(paquete.fechaInicio, paquete.fechaFin);
  const precioTotal = calcularPrecioPaquete(paquete);

  // Precio base por noche de todas las habitaciones
  const precioBase = paquete.habitaciones.reduce(
    (suma, hab) => suma + hab.precio,
    0
  );

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {paquete.nombre}
          </h3>
          <div className="mx-4 border-l border-gray-300 dark:border-gray-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Incluye {paquete.habitaciones.length} habitación
            {paquete.habitaciones.length !== 1 ? 'es' : ''}
          </p>
        </div>
        {/* Precio base por noche (sin noches ni descuentos) */}
        <PriceTag precio={precioBase} coeficiente={porcentaje} />
      </div>
      <hr className="my-4 border-gray-300 dark:border-gray-600" />
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Noches: {noches} | Descuento: {paquete.descuento}%
        </div>
        {/* Precio final con noches, descuento y coeficiente */}
        <PriceTag precio={precioTotal} coeficiente={porcentaje} />
      </div>
      <div className="mt-3">
        <p className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">
          Habitaciones Incluidas:
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-1">
          {paquete.habitaciones.map((hab) => (
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
};

export default PaqueteCard;
