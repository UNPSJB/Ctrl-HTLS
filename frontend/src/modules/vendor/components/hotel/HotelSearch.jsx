import { useState, useCallback, useEffect } from 'react';
import { useBusqueda } from '@vendor-context/BusquedaContext';
import { useAuth } from '@/context/AuthContext';
import dateUtils from '@utils/dateUtils';
import { Search, MapPin, Calendar, Users, Globe, Building, ChevronRight, SlidersHorizontal } from 'lucide-react';
import useUbicacion from '@hooks/useUbicacion';
import { toast } from 'react-hot-toast';
import { FormField, Input, SelectInput, SearchInput } from '@ui/form';
import CounterInput from '@ui/form/CounterInput';

const { toISODate } = dateUtils;

function HotelSearch({
  onSearch,
  isLoading,
  isDisabled = false,
  isCompact = false,
  onExpand
}) {
  const { user } = useAuth();
  const { filtros, actualizarFiltros } = useBusqueda();
  const {
    paises,
    provincias,
    ciudades,
    paisId,
    provinciaId,
    ciudadId,
    handlePaisChange,
    handleProvinciaChange,
    handleCiudadChange,
    isProvinciasDisabled,
    isCiudadesDisabled,
    loadingPaises,
    loadingProvincias,
    loadingCiudades,
    setInitialUbicacion,
  } = useUbicacion();

  const [localFilters, setLocalFilters] = useState({
    nombre: '',
    fechaInicio: isCompact ? (filtros?.fechaInicio ? toISODate(filtros.fechaInicio) : toISODate(new Date())) : '',
    fechaFin: isCompact ? (filtros?.fechaFin ? toISODate(filtros.fechaFin) : toISODate(new Date(Date.now() + 86400000))) : '',
    capacidad: 2,
  });

  // Hidratar desde contexto al montar y cuando cambie el modo
  useEffect(() => {
    if (isCompact && filtros) {
      setLocalFilters({
        nombre: filtros.nombre || '',
        fechaInicio: filtros.fechaInicio ? toISODate(filtros.fechaInicio) : toISODate(new Date()),
        fechaFin: filtros.fechaFin ? toISODate(filtros.fechaFin) : toISODate(new Date(Date.now() + 86400000)),
        capacidad: filtros.capacidad || 2,
      });

      if (filtros.ubicacion || filtros.paisId) {
        setInitialUbicacion(filtros.paisId, filtros.provinciaId, filtros.ubicacion);
      }
    } else if (!isCompact) {
      // En modo expandido, forzamos limpieza de fechas según requerimiento
      setLocalFilters(prev => ({
        ...prev,
        fechaInicio: '',
        fechaFin: ''
      }));
    }
  }, [isCompact, filtros]);

  const getToday = useCallback(() => toISODate(new Date()), []);

  const getTomorrow = (dateStr) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ciudadId || !localFilters.fechaInicio || !localFilters.fechaFin) {
      toast.error(
        'Por favor, seleccione una ciudad y un rango de fechas para la búsqueda.'
      );
      return;
    }

    // Sincronizar con contexto global
    actualizarFiltros({
      nombre: localFilters.nombre,
      ubicacion: ciudadId,
      paisId,
      provinciaId,
      fechaInicio: toISODate(localFilters.fechaInicio),
      fechaFin: toISODate(localFilters.fechaFin),
      capacidad: localFilters.capacidad,
    });

    const params = {
      ubicacion: ciudadId,
      fechaInicio: new Date(localFilters.fechaInicio).toISOString(),
      fechaFin: new Date(localFilters.fechaFin).toISOString(),
      pasajeros: localFilters.capacidad,
      nombreHotel: localFilters.nombre || 'null',
      vendedorId: user?.id,
    };

    if (typeof onSearch === 'function') {
      await onSearch(params);
    }
  };

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const isDateRangeValid = localFilters.fechaInicio && localFilters.fechaFin && new Date(localFilters.fechaFin) > new Date(localFilters.fechaInicio);
  const canSubmit = ciudadId && isDateRangeValid && !isLoading && !isDisabled;
  const fieldDisabled = isLoading || isDisabled;

  // Renderizado Compacto (VISTA PROFESIONAL REFINADA)
  const renderCompact = () => (
    <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
      <button
        type="button"
        onClick={onExpand}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900"
        title="Editar parámetros"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-[200px]">
        <SearchInput
          value={localFilters.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Hotel..."
          className="h-10 !py-0 border-gray-200 dark:border-gray-700"
        />
      </div>

      <div className="w-44">
        <SelectInput
          icon={MapPin}
          value={ciudadId}
          onChange={(e) => handleCiudadChange(e.target.value)}
          disabled={isCiudadesDisabled || loadingCiudades}
          className="h-10 !py-0 text-sm border-gray-200 dark:border-gray-700 shadow-none"
        >
          <option value="">Ciudad...</option>
          {ciudades.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </SelectInput>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-32">
          <Input
            type="date"
            value={localFilters.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className="h-10 px-2 text-xs border-gray-200 dark:border-gray-700 shadow-none"
          />
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
        <div className="w-32">
          <Input
            type="date"
            value={localFilters.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className="h-10 px-2 text-xs border-gray-200 dark:border-gray-700 shadow-none"
          />
        </div>
      </div>

      <div className="w-24">
        <CounterInput
          icon={Users}
          value={localFilters.capacidad}
          min={1}
          onChange={(val) => handleChange('capacidad', val)}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <Search className="h-4 w-4" />}
        <span>Actualizar</span>
      </button>
    </div>
  );

  // Renderizado Expandido (HERRAMIENTA PROFESIONAL CORP)
  const renderHero = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Fila 1: Identificación del Alojamiento */}
      <div className="border-b border-gray-100 pb-4 dark:border-gray-700">
        <FormField label="Hotel o Alojamiento" icon={Search} containerClassName="max-w-3xl">
          <SearchInput
            value={localFilters.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Nombre del hotel (opcional)"
            className="rounded-md"
          />
        </FormField>
      </div>

      {/* Fila 2: Ubicación Geográfica (Horizontal) */}
      <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-3">
        <FormField label="País" icon={Globe}>
          <SelectInput
            value={paisId}
            onChange={(e) => handlePaisChange(e.target.value)}
            disabled={loadingPaises}
            className="rounded-md border-gray-200 dark:border-gray-700"
          >
            <option value="">{loadingPaises ? 'Cargando...' : 'Seleccionar país'}</option>
            {paises.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </SelectInput>
        </FormField>

        <FormField label="Provincia" icon={Building}>
          <SelectInput
            value={provinciaId}
            onChange={(e) => handleProvinciaChange(e.target.value)}
            disabled={isProvinciasDisabled || loadingProvincias}
            className="rounded-md border-gray-200 dark:border-gray-700"
          >
            <option value="">{loadingProvincias ? 'Cargando...' : 'Elegir provincia'}</option>
            {provincias.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </SelectInput>
        </FormField>

        <FormField label="Ciudad de Destino" icon={MapPin} required>
          <SelectInput
            value={ciudadId}
            onChange={(e) => handleCiudadChange(e.target.value)}
            disabled={isCiudadesDisabled || loadingCiudades}
            className="rounded-md border-gray-200 dark:border-gray-700"
          >
            <option value="">{loadingCiudades ? 'Cargando...' : 'Seleccionar ciudad'}</option>
            {ciudades.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </SelectInput>
        </FormField>
      </div>

      {/* Fila 3: Estancia y Ejecución (Fila Unificada) */}
      <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 items-end md:grid-cols-12 dark:border-gray-700">
        <div className="md:col-span-3">
          <FormField label="Check-in" icon={Calendar} required>
            <Input
              type="date"
              value={localFilters.fechaInicio}
              min={getToday()}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              className="rounded-md"
            />
          </FormField>
        </div>

        <div className="md:col-span-3">
          <FormField label="Check-out" icon={Calendar} required>
            <Input
              type="date"
              value={localFilters.fechaFin}
              min={localFilters.fechaInicio || getToday()}
              onChange={(e) => handleChange('fechaFin', e.target.value)}
              className="rounded-md"
            />
          </FormField>
        </div>

        <div className="md:col-span-3">
          <FormField label="Pasajeros" icon={Users}>
            <CounterInput
              icon={Users}
              value={localFilters.capacidad}
              min={1}
              onChange={(val) => handleChange('capacidad', val)}
              className="rounded-md h-[50px]"
            />
          </FormField>
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-[50px] w-full px-2 items-center justify-center gap-2 rounded-md bg-blue-700 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-800 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Search className="h-4 w-4" />}
            <span>Consultar Disponibilidad</span>
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className={`transition-all duration-700 ease-in-out ${isCompact
      ? 'mb-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800'
      : 'mx-auto max-w-6xl rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800'}`}>

      {!isCompact && (
        <div className="mb-8 text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">Buscador de Disponibilidad</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Terminal de reservas corporativas.</p>
        </div>
      )}

      <fieldset disabled={fieldDisabled} className={fieldDisabled ? 'opacity-60 grayscale-[50%]' : ''}>
        <form onSubmit={handleSubmit}>
          {isCompact ? renderCompact() : renderHero()}
        </form>
      </fieldset>
    </div>
  );
}

export default HotelSearch;
