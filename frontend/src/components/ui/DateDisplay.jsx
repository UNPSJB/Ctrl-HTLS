import { Calendar, Moon } from 'lucide-react';
import dateUtils from '@utils/dateUtils';
import { useMemo } from 'react';

const { formatFecha, nightsBetween } = dateUtils;

function DateDisplay({ fechaInicio, fechaFin }) {
  // Calculamos las noches dentro del componente
  const nights = useMemo(
    () => nightsBetween(fechaInicio, fechaFin, { useUTC: true }),
    [fechaInicio, fechaFin]
  );

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-1.5" title="Fechas del alquiler">
        <Calendar className="h-4 w-4" />
        <span>
          {formatFecha(fechaInicio)} → {formatFecha(fechaFin)}
        </span>
      </div>
      <div
        className="flex items-center gap-1.5 font-medium"
        title={`Total de ${nights} noches`}
      >
        <Moon className="h-4 w-4" />
        <span>
          {nights} Noche{nights > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export default DateDisplay;
