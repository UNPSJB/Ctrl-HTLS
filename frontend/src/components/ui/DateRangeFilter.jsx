import { useState, useEffect } from 'react';
import SelectInput from '@/components/ui/form/SelectInput';
import Input from '@/components/ui/form/Input';
import AppButton from '@/components/ui/AppButton';
import { Search, ChevronRight } from 'lucide-react';

/**
 * Componente de filtrado por rango de fechas con botón de búsqueda.
 * Permite seleccionar rangos predefinidos o un rango personalizado.
 * Solo dispara la búsqueda cuando se presiona el botón.
 *
 * @param {Object} value - Estado inicial/actual del filtro { tipo, inicio, fin }
 * @param {Function} onSearch - Función que recibe el nuevo estado al buscar
 * @param {Boolean} loading - Si está cargando, deshabilita los controles
 */
export default function DateRangeFilter({ value, onSearch, loading }) {
  // Estado local para permitir edición sin disparar búsqueda inmediata
  const [localValue, setLocalValue] = useState(value);

  // Sincronizar con el valor externo si este cambia (ej: reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTypeChange = (e) => {
    setLocalValue({ ...localValue, tipo: e.target.value });
  };

  const handleDateChange = (field, e) => {
    const val = e.target.value;
    setLocalValue((prev) => {
      const next = { ...prev, [field]: val };
      // Si cambia inicio y fin es anterior al nuevo inicio, limpiarla
      // (permitimos fechaInicio === fechaFin porque el backend lo acepta)
      if (field === 'inicio' && next.fin && next.fin < val) {
        next.fin = '';
      }
      return next;
    });
  };

  const handleSearch = () => {
    onSearch(localValue);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-40">
        <SelectInput
          value={localValue.tipo}
          onChange={handleTypeChange}
          disabled={loading}
          className="h-10 py-1.5 text-sm font-medium"
        >
          <option value="currentWeek">Semana actual</option>
          <option value="previousWeek">Semana anterior</option>
          <option value="currentMonth">Mes actual</option>
          <option value="previousMonth">Mes anterior</option>
          <option value="last3Months">Últimos 3 meses</option>
          <option value="all">Todo el historial</option>
          <option value="custom">Personalizado</option>
        </SelectInput>
      </div>

      {localValue.tipo === 'custom' && (
        <div className="animate-in fade-in slide-in-from-left-2 flex items-center gap-2 duration-300">
          <Input
            type="date"
            value={localValue.inicio}
            disabled={loading}
            min="2010-01-01"
            onChange={(e) => handleDateChange('inicio', e)}
            className="h-10 w-32 py-1.5 text-sm"
          />
          <ChevronRight className="w-4 text-gray-500" />
          <Input
            type="date"
            value={localValue.fin}
            disabled={loading}
            min={localValue.inicio}
            onChange={(e) => handleDateChange('fin', e)}
            className="h-10 w-32 py-1.5 text-sm"
          />
        </div>
      )}

      <AppButton
        variant="blue"
        size="sm"
        onClick={handleSearch}
        loading={loading}
        disabled={
          loading ||
          (localValue.tipo === 'custom' &&
            (!localValue.inicio || !localValue.fin))
        }
        icon={Search}
        className="h-10"
      >
        Buscar
      </AppButton>
    </div>
  );
}
