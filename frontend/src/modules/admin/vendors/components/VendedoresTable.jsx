import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, BarChart3, User, Users } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 100;

const VendedoresTable = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/vendedores');
      setVendedores(response.data);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      setError(errorMsg);
      toast.error(errorMsg, { id: 'fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/vendedores/editar/${id}`);
  };

  const filteredVendedores = useMemo(() => {
    if (!searchTerm) return vendedores;
    const lowerTerm = searchTerm.toLowerCase();
    return vendedores.filter(v =>
      v.nombre.toLowerCase().includes(lowerTerm) ||
      v.apellido.toLowerCase().includes(lowerTerm) ||
      v.numeroDocumento.includes(lowerTerm) ||
      v.email.toLowerCase().includes(lowerTerm)
    );
  }, [vendedores, searchTerm]);

  const totalPages = Math.ceil(filteredVendedores.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVendedores.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredVendedores]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este vendedor?')) {
      try {
        await axiosInstance.delete(`/empleado/${id}`);
        setVendedores(prev => prev.filter((v) => v.id !== id));
      } catch (err) {
        alert('Error al eliminar vendedor');
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

        {/* Barra de Búsqueda: Centrada y dentro de la tabla */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="max-w-md">
            <SearchInput
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              disabled={loading}
            />
          </div>
        </div>

        {/* Tabla Estándar */}
        <div className="relative flex flex-col flex-grow overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Cargando personal de ventas..." />
            </div>
          )}

          <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              {filteredVendedores.length > 0 ? (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentItems.map((vendedor) => (
                    <tr key={vendedor.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center truncate">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4 truncate">
                            <div className="font-medium text-gray-900 dark:text-white transition-all max-w-[200px] truncate md:max-w-[300px]">
                              {capitalizeFirst(vendedor.nombre)} {capitalizeFirst(vendedor.apellido)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                        <span className="font-semibold uppercase mr-2">{vendedor.tipoDocumento}</span>
                        {vendedor.numeroDocumento}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {vendedor.email || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                        {vendedor.telefono || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <TableButton
                            variant="view"
                            icon={BarChart3}
                            onClick={() => navigate(`/admin/vendedores/liquidaciones/${vendedor.id}`)}
                            title="Actividad y Liquidaciones"
                          />
                          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(vendedor.id)} />
                          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(vendedor.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="mb-2 h-8 w-8 opacity-50" />
                        <p>No se encontraron vendedores que coincidan con la búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Paginación */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredVendedores.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default VendedoresTable;
