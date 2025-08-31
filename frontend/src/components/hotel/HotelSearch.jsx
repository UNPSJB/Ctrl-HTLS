import { useState } from 'react';
import { useBusqueda } from '@context/BusquedaContext';
import { Search, MapPin, Calendar, Users, Star } from 'lucide-react';

function HotelSearch() {
  // Obtenemos la función para actualizar el contexto utilizando el hook personalizado
  const { actualizarFiltros } = useBusqueda();

  // Estado local para almacenar los filtros del formulario
  const [localFilters, setLocalFilters] = useState({
    nombre: '',
    ubicacion: '',
    fechaInicio: '',
    fechaFin: '',
    capacidad: 1,
    estrellas: 0,
  });

  // Función para validar el rango de fechas
  const validateDates = () => {
    if (localFilters.fechaInicio && localFilters.fechaFin) {
      // Se valida que la fecha de inicio sea menor o igual a la fecha de fin
      return (
        new Date(localFilters.fechaInicio) <= new Date(localFilters.fechaFin)
      );
    }
    return true;
  };

  // Maneja el envío del formulario y actualiza el contexto
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateDates()) {
      alert('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }
    // Actualizamos el contexto con los filtros locales
    actualizarFiltros(localFilters);
    console.log('Filtros actualizados:', localFilters);
  };

  return (
    <div className="p-6 mb-8 shadow-search">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primera fila: Nombre, Ubicación y Estrellas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Hotel
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localFilters.nombre}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, nombre: e.target.value })
                }
                placeholder="Buscar hotel..."
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localFilters.ubicacion}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    ubicacion: e.target.value,
                  })
                }
                placeholder="Ciudad, País..."
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estrellas
            </label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
              <select
                value={localFilters.estrellas}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    estrellas: Number(e.target.value),
                  })
                }
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value={0}>Todas las estrellas</option>
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'estrella' : 'estrellas'} o más
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Segunda fila: Fechas y Capacidad */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={localFilters.fechaInicio}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    fechaInicio: e.target.value,
                  })
                }
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={localFilters.fechaFin}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, fechaFin: e.target.value })
                }
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capacidad
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={localFilters.capacidad}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    capacidad: Number(e.target.value),
                  })
                }
                className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end py-1">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HotelSearch;
