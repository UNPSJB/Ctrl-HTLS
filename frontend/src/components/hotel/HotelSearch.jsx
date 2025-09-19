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
    <div className="shadow-search mb-8 rounded-lg bg-white p-6 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primera fila: Nombre, Ubicación y Estrellas */}
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
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, nombre: e.target.value })
                }
                placeholder="Buscar hotel..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estrellas
            </label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
              <select
                value={localFilters.estrellas}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    estrellas: Number(e.target.value),
                  })
                }
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
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
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    fechaInicio: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, fechaFin: e.target.value })
                }
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
              <select
                value={localFilters.capacidad}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    capacidad: Number(e.target.value),
                  })
                }
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
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
