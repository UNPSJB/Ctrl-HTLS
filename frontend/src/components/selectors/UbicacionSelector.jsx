import useUbicacion from '@/hooks/useUbicacion';

const UbicacionSelector = ({ errors = {} }) => {
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
            onChange={(e) => handlePaisChange(e.target.value)}
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
            onChange={(e) => handleProvinciaChange(e.target.value)}
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
            onChange={(e) => handleCiudadChange(e.target.value)}
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
    </div>
  );
};

export default UbicacionSelector;
