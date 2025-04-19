import PriceTag from '@/components/PriceTag';
import { Users } from 'lucide-react';

const HabitacionCard = ({ habitacion, porcentaje = 1 }) => {
  // Validación si habitacion es nula o indefinida
  if (!habitacion) return null;

  // Calcular fechas y noches antes del return
  const inicio = new Date(habitacion.fechaInicio);
  const fin = new Date(habitacion.fechaFin);
  const diffTime = Math.abs(fin - inicio);
  const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Formatear fechas a dd/mm/aaaa
  const formatFecha = (fecha) => {
    const d = new Date(fecha);
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
          <div className="mx-4 border-l border-gray-300 dark:border-gray-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {/* Se muestra la capacidad de la habitación */}
            Capacidad: {habitacion.capacidad} personas
          </p>
        </div>
        <PriceTag precio={habitacion.precio} coeficiente={porcentaje} />
      </div>
      <hr className="my-4 border-gray-300 dark:border-gray-600" />
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatFecha(habitacion.fechaInicio)} {' - '}
          {formatFecha(habitacion.fechaFin)} {' - '} ( {noches} noche
          {noches > 1 ? 's' : ''} )
        </div>
        <PriceTag
          precio={habitacion.precio * noches}
          coeficiente={porcentaje}
        />
      </div>
    </div>
  );
};

export default HabitacionCard;
