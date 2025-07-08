'use client';

import useUbicacion from '@/hooks/useUbicacion';
import { useEffect } from 'react';

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
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Ubicación
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            País *
          </label>
          <select
            value={paisId}
            onChange={(e) => handlePaisChangeInternal(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
            <p className="text-red-500 text-sm">{errors.paisId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Provincia/Estado *
          </label>
          <select
            value={provinciaId}
            onChange={(e) => handleProvinciaChangeInternal(e.target.value)}
            disabled={isProvinciasDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.provinciaId ? 'border-red-500' : 'border-gray-300'
            } ${isProvinciasDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
            <p className="text-red-500 text-sm">{errors.provinciaId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ciudad *
          </label>
          <select
            value={ciudadId}
            onChange={(e) => handleCiudadChangeInternal(e.target.value)}
            disabled={isCiudadesDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.ciudadId ? 'border-red-500' : 'border-gray-300'
            } ${isCiudadesDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
            <p className="text-red-500 text-sm">{errors.ciudadId.message}</p>
          )}
        </div>
      </div>

      {/* Vista previa de la ubicación seleccionada */}
      {paisId && provinciaId && ciudadId && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <strong>Ubicación seleccionada:</strong>{' '}
            {ciudades.find((c) => c.id.toString() === ciudadId)?.nombre},{' '}
            {provincias.find((p) => p.id.toString() === provinciaId)?.nombre},{' '}
            {paises.find((p) => p.id.toString() === paisId)?.nombre}
          </p>
        </div>
      )}
    </div>
  );
};

export default UbicacionSelector;
