import useUbicacion from '@/hooks/useUbicacion';
import { useEffect } from 'react';

const UbicacionSelector = ({ errors = {}, register, setValue }) => {
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
  } = useUbicacion();

  // Sincronizar los valores del hook useUbicacion con react-hook-form
  useEffect(() => {
    setValue('paisId', paisId);
  }, [paisId, setValue]);

  useEffect(() => {
    setValue('provinciaId', provinciaId);
  }, [provinciaId, setValue]);

  useEffect(() => {
    setValue('ciudadId', ciudadId);
  }, [ciudadId, setValue]);

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

  return (
    <div className="space-y-4">
      <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Ubicación
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            País *
          </label>
          <select
            {...register('paisId', { required: 'Debe seleccionar un país' })}
            value={paisId}
            onChange={(e) => handlePaisChangeInternal(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.paisId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar país</option>
            {(paises || []).map((pais) => (
              <option key={pais.id} value={pais.id.toString()}>
                {pais.nombre}
              </option>
            ))}
          </select>
          {errors.paisId && (
            <p className="text-sm text-red-500">{errors.paisId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Provincia/Estado *
          </label>
          <select
            {...register('provinciaId', {
              required: 'Debe seleccionar una provincia',
            })}
            value={provinciaId}
            onChange={(e) => handleProvinciaChangeInternal(e.target.value)}
            disabled={isProvinciasDisabled}
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.provinciaId ? 'border-red-500' : 'border-gray-300'
            } ${isProvinciasDisabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
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
            <p className="text-sm text-red-500">{errors.provinciaId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ciudad *
          </label>
          <select
            {...register('ciudadId', {
              required: 'Debe seleccionar una ciudad',
            })}
            value={ciudadId}
            onChange={(e) => handleCiudadChangeInternal(e.target.value)}
            disabled={isCiudadesDisabled}
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.ciudadId ? 'border-red-500' : 'border-gray-300'
            } ${isCiudadesDisabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
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
            <p className="text-sm text-red-500">{errors.ciudadId.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UbicacionSelector;
