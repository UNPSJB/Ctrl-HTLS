import React, { useState, useEffect } from 'react';
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
    setLocalValue({ ...localValue, [field]: e.target.value });
  };

  const handleSearch = () => {
    onSearch(localValue);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-44">
        <SelectInput
          value={localValue.tipo}
          onChange={handleTypeChange}
          disabled={loading}
          className="h-10 py-1.5 text-sm font-medium"
        >
          <option value="all">Todo el historial</option>
          <option value="lastWeek">Última semana</option>
          <option value="lastMonth">Último mes</option>
          <option value="last3Months">Últimos 3 meses</option>
          <option value="custom">Rango personalizado</option>
        </SelectInput>
      </div>

      {localValue.tipo === 'custom' && (
        <div className="animate-in fade-in slide-in-from-left-2 flex items-center gap-2 duration-300">
          <Input
            type="date"
            value={localValue.inicio}
            disabled={loading}
            onChange={(e) => handleDateChange('inicio', e)}
            className="h-10 w-36 py-1.5 text-sm"
          />
          <ChevronRight className="w-4 text-gray-500" />
          <Input
            type="date"
            value={localValue.fin}
            disabled={loading}
            onChange={(e) => handleDateChange('fin', e)}
            className="h-10 w-36 py-1.5 text-sm"
          />
        </div>
      )}

      <AppButton
        variant="blue"
        size="sm"
        onClick={handleSearch}
        loading={loading}
        icon={Search}
        className="h-10"
      >
        Buscar
      </AppButton>
    </div>
  );
}
