import { useState, useMemo } from 'react';
import { Edit, Trash2, Eye, Plus, Search, MapPin, Star, Building2, X } from 'lucide-react';
import TableButton from '@/components/ui/TableButton';
import { useHotelsData } from '@/hooks/useHotelsData';
import { Loading } from '@/components/ui/Loading';
import { useNavigate } from 'react-router-dom';

const AdminHotelList = () => {
  const { hoteles, loading, error } = useHotelsData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (id) => {
    navigate(`/admin/hoteles/editar/${id}`);
  };

  const handleCreate = () => {
    navigate('/admin/hoteles/nuevo');
  };

  const handleDelete = () => {
    // Sin funcionalidad
  };

  const handleView = () => {
    // Sin funcionalidad
  };

  // Filtrado simple (sin paginación por ahora, pero con estructura lista)
  const filteredHoteles = useMemo(() => {
    if (!hoteles) return [];
    if (!searchTerm) return hoteles;
    const lowerTerm = searchTerm.toLowerCase();
    return hoteles.filter(h =>
      h.nombre.toLowerCase().includes(lowerTerm) ||
      h.ubicacion?.nombreCiudad?.toLowerCase().includes(lowerTerm) ||
      h.ubicacion?.nombreProvincia?.toLowerCase().includes(lowerTerm)
    );
  }, [hoteles, searchTerm]);

  // Render logic matches VendedoresList structure
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando hoteles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow dark:border-red-700 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Acciones */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Hoteles</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Administra los hoteles, ubicaciones y categorías</p>
        </div>
        <div className="flex gap-2">
          {/* Botones de acción adicionales si fueran necesarios */}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo Hotel
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad o provincia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[300px]">
          {filteredHoteles.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Hotel
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ubicación
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Categoría
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHoteles.map((hotel) => (
                  <tr
                    key={hotel.hotelId}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {hotel.nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            {/* Optional secondary info */}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                        <div>
                          <span className="font-medium">{hotel.ubicacion.nombreCiudad}</span>
                          <span className="text-gray-400 mx-1">•</span>
                          <span className="text-xs text-gray-500">{hotel.ubicacion.nombreProvincia}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 w-fit border border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                          {hotel.categoria.estrellas} Estrellas
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <TableButton
                          variant="view"
                          icon={Eye}
                          onClick={() => handleView()}
                          aria-label="Ver detalles"
                        />
                        <TableButton
                          variant="edit"
                          icon={Edit}
                          onClick={() => handleEdit(hotel.hotelId)}
                          aria-label="Editar"
                        />
                        <TableButton
                          variant="delete"
                          icon={Trash2}
                          onClick={() => handleDelete()}
                          aria-label="Eliminar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No se encontraron hoteles que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHotelList;
