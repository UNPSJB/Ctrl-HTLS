import { useState, useEffect, useCallback } from 'react';
import { useBusqueda } from '@context/BusquedaContext';
import dateUtils from '@utils/dateUtils';
import { Search, MapPin, Calendar, Users, Globe, Building } from 'lucide-react';

const { toISODate } = dateUtils;

function HotelSearch() {
  const { filtros, actualizarFiltros } = useBusqueda();

  // Inicializar fechas a partir del contexto (persisted). Convertimos a "YYYY-MM-DD" para inputs.
  const fechaInicioInicial = toISODate(filtros?.fechaInicio) ?? '';
  const fechaFinInicial = toISODate(filtros?.fechaFin) ?? '';

  // Estado local para almacenar los filtros del formulario
  const [localFilters, setLocalFilters] = useState({
    nombre: '',
    pais: '',
    provincia: '',
    ciudad: '',
    fechaInicio: fechaInicioInicial,
    fechaFin: fechaFinInicial,
    capacidad: 1,
  });

  // Si el contexto cambia desde otro lugar (ej: restauración), sincronizamos localmente.
  useEffect(() => {
    const nuevaInicio = toISODate(filtros?.fechaInicio) ?? '';
    const nuevaFin = toISODate(filtros?.fechaFin) ?? '';

    setLocalFilters((prev) => {
      if (prev.fechaInicio === nuevaInicio && prev.fechaFin === nuevaFin)
        return prev;
      return { ...prev, fechaInicio: nuevaInicio, fechaFin: nuevaFin };
    });
  }, [filtros?.fechaInicio, filtros?.fechaFin]);

  const getToday = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Validación sencilla de rango de fechas
  const validateDates = useCallback(
    (values) => {
      const { fechaInicio, fechaFin } = values ?? localFilters;
      if (fechaInicio && fechaFin) {
        return new Date(fechaInicio) <= new Date(fechaFin);
      }
      return true;
    },
    [localFilters]
  );

  // Submit (botón Buscar)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDates(localFilters)) {
      alert('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }
    // Aquí actualizamos todo el contexto de filtros de una sola vez
    actualizarFiltros(localFilters);
    console.log('Filtros actualizados (submit):', localFilters);
  };

  // Handler cuando se presiona Enter en cualquier input: validamos y aplicamos (sin tocar onChange)
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    // Evitamos que el navegador haga un submit por defecto si estamos manejando aquí
    e.preventDefault();
    if (!validateDates(localFilters)) {
      alert('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }
    actualizarFiltros(localFilters);
    console.log('Filtros actualizados (Enter):', localFilters);
  };

  // Cambios locales: actualizan sólo el estado local, NO el contexto
  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="shadow-search mb-8 rounded-lg bg-white p-6 dark:bg-gray-800">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onKeyDown={handleKeyDown}
      >
        {/* Primera fila: Nombre del Hotel, País, Provincia, Ciudad */}
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
              <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localFilters.pais}
                onChange={(e) => handleChange('pais', e.target.value)}
                placeholder="Ej: Argentina"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Provincia
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localFilters.provincia}
                onChange={(e) => handleChange('provincia', e.target.value)}
                placeholder="Ej: Buenos Aires"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ciudad
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localFilters.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                placeholder="Ej: Mar del Plata"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Segunda fila: Fechas, Capacidad y Botón de Búsqueda */}
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
              Capacidad
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
                placeholder="Número de personas"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-end py-1">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
              Buscar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HotelSearch;
