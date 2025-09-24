import { useState } from 'react';
import { useBusqueda } from '@context/BusquedaContext';
import { Search, MapPin, Calendar, Users, Globe, Building } from 'lucide-react';

function HotelSearch() {
  // Obtenemos la función para actualizar el contexto utilizando el hook personalizado
  const { actualizarFiltros } = useBusqueda();

  // Estado local para almacenar los filtros del formulario
  const [localFilters, setLocalFilters] = useState({
    nombre: '',
    pais: '',
    provincia: '',
    ciudad: '',
    fechaInicio: '',
    fechaFin: '',
    capacidad: 1,
  });

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
              País
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localFilters.pais}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    pais: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    provincia: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    ciudad: e.target.value,
                  })
                }
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
                min={localFilters.fechaInicio || getToday()}
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
              <input
                type="number"
                value={localFilters.capacidad}
                min="1"
                max="100"
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    capacidad: Number(e.target.value),
                  })
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
