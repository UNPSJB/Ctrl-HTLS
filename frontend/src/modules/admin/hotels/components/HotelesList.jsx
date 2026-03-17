import { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, Search, MapPin, Star, Building2, X, User, ChevronLeft, ChevronRight } from 'lucide-react';
import TableButton from '@/components/ui/TableButton';
import { useHotelsData } from '@/hooks/useHotelsData';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useNavigate } from 'react-router-dom';

// Lista principal de hoteles para administración
const HotelesList = () => {
  const { hoteles, loading, error } = useHotelsData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const totalPages = Math.ceil(filteredHoteles.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHoteles.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredHoteles]);



  const handleDelete = () => {

  };

  const handleView = (id) => {
    navigate(`/admin/hoteles/${id}/dashboard`);
  };

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
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

      <div className="relative flex flex-col min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
            <InnerLoading message="Sincronizando hoteles..." />
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredHoteles.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Información del Hotel</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((hotel) => (
                  <tr
                    key={hotel.hotelId}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                  >
                  <td className="px-6 py-3">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {hotel.nombre}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {hotel.encargadoNombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium">{hotel.ubicacion.nombreCiudad}</span>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="text-xs text-gray-500">{hotel.ubicacion.nombreProvincia}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 w-fit border border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                        {hotel.categoria.estrellas} Estrellas
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <TableButton
                        variant="view"
                        icon={Eye}
                        onClick={() => handleView(hotel.hotelId)}
                        aria-label="Ver detalles"
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
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron hoteles que coincidan con la búsqueda.</p>
          </div>
          )}
        </div>
      </div>

      {/* Paginación Estándar */}
      {!loading && filteredHoteles.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredHoteles.length)}</span> de <span className="font-medium text-gray-900 dark:text-white">{filteredHoteles.length}</span> resultados
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelesList;
