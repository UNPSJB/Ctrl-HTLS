import { useState, useCallback } from 'react';
import { useBusqueda } from '@context/BusquedaContext';
import dateUtils from '@utils/dateUtils';
import { Search, MapPin, Calendar, Users, Globe, Building } from 'lucide-react';
import useUbicacion from '@hooks/useUbicacion';

const { toISODate } = dateUtils;

// Recibe onSearch y isLoading como props desde HomePage
function HotelSearch({ onSearch, isLoading }) {
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
  } = useUbicacion();

  const [localFilters, setLocalFilters] = useState({
    nombre: filtros?.nombre || '',
    fechaInicio: toISODate(filtros?.fechaInicio) ?? '',
    fechaFin: toISODate(filtros?.fechaFin) ?? '',
    capacidad: filtros?.capacidad || 2,
  });

  const getToday = useCallback(
    () => new Date().toISOString().split('T')[0],
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    actualizarFiltros({ ...localFilters, paisId, provinciaId, ciudadId });

    if (!ciudadId || !localFilters.fechaInicio || !localFilters.fechaFin) {
      alert(
        'Por favor, seleccione una ciudad y un rango de fechas para la búsqueda.'
      );
      return;
    }

    const params = {
      ubicacion: ciudadId,
      fechaInicio: new Date(localFilters.fechaInicio).toISOString(),
      fechaFin: new Date(localFilters.fechaFin).toISOString(),
      pasajeros: localFilters.capacidad,
      nombreHotel: localFilters.nombre || 'null',
      vendedorId: 2,
    };

    // Llama a la función del padre para iniciar la búsqueda
    if (typeof onSearch === 'function') {
      await onSearch(params);
    }
  };

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="shadow-search mb-8 rounded-lg bg-white p-6 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fila 1: Nombre y Ubicación */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del Hotel
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localFilters.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Buscar hotel..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              País
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                value={paisId}
                onChange={(e) => handlePaisChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="">Seleccionar país</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Provincia
            </label>
            <div className="relative">
              <Building className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                value={provinciaId}
                onChange={(e) => handleProvinciaChange(e.target.value)}
                disabled={isProvinciasDisabled}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:disabled:bg-gray-600"
              >
                <option value="">Seleccionar provincia</option>
                {provincias.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ciudad
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                value={ciudadId}
                onChange={(e) => handleCiudadChange(e.target.value)}
                disabled={isCiudadesDisabled}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:disabled:bg-gray-600"
              >
                <option value="">Seleccionar ciudad</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fila 2: Fechas, Capacidad y Botón */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={localFilters.fechaInicio}
                min={getToday()}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de Fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={localFilters.fechaFin}
                min={localFilters.fechaInicio || getToday()}
                onChange={(e) => handleChange('fechaFin', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Huéspedes
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={localFilters.capacidad}
                min="1"
                max="100"
                onChange={(e) =>
                  handleChange('capacidad', Number(e.target.value))
                }
                placeholder="Huéspedes"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-end py-1">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors duration-200 ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Buscar
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HotelSearch;
