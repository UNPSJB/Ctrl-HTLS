import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import useUbicacion from '@/hooks/useUbicacion';

// Selector cascada de ubicación: País -> Provincia -> Ciudad
const UbicacionSelector = ({ errors = {}, register, setValue, watch }) => {
  const {
    paises,
    provincias,
    ciudades,
    paisId,
    provinciaId,
    ciudadId,
    isProvinciasDisabled,
    isCiudadesDisabled,
    handlePaisChange,
    handleProvinciaChange,
    handleCiudadChange,
    setInitialUbicacion,
  } = useUbicacion();

  // Sincronización inicial desde el formulario (Modo Edición)
  useEffect(() => {
    const fPaisId = watch('paisId');
    const fProvinciaId = watch('provinciaId');
    const fCiudadId = watch('ciudadId');

    if (fPaisId && !paisId) {
      setInitialUbicacion(fPaisId, fProvinciaId, fCiudadId);
    }
  }, [watch, paisId, setInitialUbicacion]);

  // Actualizar el formulario solo cuando el hook cambia (y sea diferente al valor actual)
  useEffect(() => {
    if (paisId && watch('paisId') !== paisId) {
      setValue('paisId', paisId);
    }
  }, [paisId, setValue, watch]);

  useEffect(() => {
    if (provinciaId && watch('provinciaId') !== provinciaId) {
      setValue('provinciaId', provinciaId);
    }
  }, [provinciaId, setValue, watch]);

  useEffect(() => {
    if (ciudadId && watch('ciudadId') !== ciudadId) {
      setValue('ciudadId', ciudadId);
    }
  }, [ciudadId, setValue, watch]);

  const handlePaisChangeInternal = (value) => {
    handlePaisChange(value);
    setValue('paisId', value);
  };

  const handleProvinciaChangeInternal = (value) => {
    handleProvinciaChange(value);
    setValue('provinciaId', value);
  };

  const handleCiudadChangeInternal = (value) => {
    handleCiudadChange(value);
    setValue('ciudadId', value);
  };

  const inputClass = (error, disabled) =>
    `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all shadow-sm ${disabled ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-800 opacity-60' : ''}`;

  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
  const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

  return (
    <>
      <div>
        <label className={labelClass}>
          País <span className="text-red-500">*</span>
        </label>
        <select
          {...register('paisId', { required: 'Debe seleccionar un país' })}
          value={paisId}
          onChange={(e) => handlePaisChangeInternal(e.target.value)}
          className={inputClass(errors.paisId)}
        >
          <option value="">Seleccionar país</option>
          {(paises || []).map((pais) => (
            <option key={pais.id} value={pais.id.toString()}>
              {pais.nombre}
            </option>
          ))}
        </select>
        {errors.paisId && (
          <p className={errorClass}>{errors.paisId.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          Provincia/Estado <span className="text-red-500">*</span>
        </label>
        <select
          {...register('provinciaId', {
            required: 'Debe seleccionar una provincia',
          })}
          value={provinciaId}
          onChange={(e) => handleProvinciaChangeInternal(e.target.value)}
          disabled={isProvinciasDisabled}
          className={inputClass(errors.provinciaId, isProvinciasDisabled)}
        >
          <option value="">
            {paisId ? 'Seleccionar provincia' : 'Primero seleccione un país'}
          </option>
          {(provincias || []).map((provincia) => (
            <option key={provincia.id} value={provincia.id.toString()}>
              {provincia.nombre}
            </option>
          ))}
        </select>
        {errors.provinciaId && (
          <p className={errorClass}>{errors.provinciaId.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          Ciudad <span className="text-red-500">*</span>
        </label>
        <select
          {...register('ciudadId', {
            required: 'Debe seleccionar una ciudad',
          })}
          value={ciudadId}
          onChange={(e) => handleCiudadChangeInternal(e.target.value)}
          disabled={isCiudadesDisabled}
          className={inputClass(errors.ciudadId, isCiudadesDisabled)}
        >
          <option value="">
            {provinciaId
              ? 'Seleccionar ciudad'
              : 'Primero seleccione una provincia'}
          </option>
          {(ciudades || []).map((ciudad) => (
            <option key={ciudad.id} value={ciudad.id.toString()}>
              {ciudad.nombre}
            </option>
          ))}
        </select>
        {errors.ciudadId && (
          <p className={errorClass}>{errors.ciudadId.message}</p>
        )}
      </div>

      {/* Redirección a Gestión de Ubicaciones */}
      <div className="col-span-full mt-2 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <MapPin className="h-4 w-4" />
        </div>
        <p>
          ¿No encuentras la ubicación que buscas?{' '}
          <a
            href="/admin/ubicacion"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-700 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Gestionar ubicaciones aquí
          </a>
        </p>
      </div>
    </>
  );
};

export default UbicacionSelector;
