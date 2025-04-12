import { Users } from 'lucide-react';

const HabitacionCard = ({ habitacion }) => {
  // Validación si habitacion es nula o indefinida
  if (!habitacion) return null;
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {habitacion.nombre}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {/* Se muestra la capacidad de la habitación */}
            Capacidad: {habitacion.capacidad} personas
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
            ${habitacion.precio}/noche
          </p>
        </div>
      </div>
    </div>
  );
};

export default HabitacionCard;
