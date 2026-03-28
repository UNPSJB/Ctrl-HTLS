import { useState, useMemo, useEffect } from 'react';
import { Edit, Eye, Plus, Search, MapPin, Star, Building2, X, User } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import { useHotelsData } from '@admin-hooks/useHotelsData';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/ui/form';

// Lista principal de hoteles para administración
const HotelesTable = () => {
  const { hoteles, loading, error } = useHotelsData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

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
          <SearchInput
            placeholder="Buscar por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          {searchTerm && !loading && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
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
                <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                  <th className="px-6 py-4">Nombre Hotel</th>
                  <th className="px-6 py-4">Encargado</th>
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {hotel.encargadoNombre || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {hotel.ubicacion?.nombreCiudad ? (
                      <span>{hotel.ubicacion.nombreCiudad}, {hotel.ubicacion.nombreProvincia || <span className="italic text-gray-400">—</span>}</span>
                    ) : (
                      <span className="italic text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {hotel.categoria?.estrellas || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                       <TableButton
                         variant="view"
                         icon={Eye}
                         onClick={() => handleView(hotel.hotelId)}
                         aria-label="Ver detalles"
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

      {/* Paginación */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredHoteles.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    </div>
  );
};

export default HotelesTable;
