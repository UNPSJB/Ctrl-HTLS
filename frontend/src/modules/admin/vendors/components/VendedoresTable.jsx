import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Search, Plus, X, DollarSign, FileText, User, Users } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';

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
      setError(err.response?.data?.error || 'Error al cargar los vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/personal/vendedores/editar/${id}`);
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

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

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
        <div className="relative flex flex-col min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Cargando personal de ventas..." />
            </div>
          )}

          <div className="overflow-x-auto">
            {filteredVendedores.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                    <th className="px-6 py-4 text-left">Nombre Completo</th>
                    <th className="px-6 py-4 text-left">Documento</th>
                    <th className="px-6 py-4 text-left">Contacto</th>
                    <th className="px-6 py-4 text-left">Hoteles</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((vendedor) => (
                    <tr key={vendedor.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800">
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4 text-sm">
                            <div className="font-medium text-gray-900 dark:text-white capitalize transition-all">
                              {vendedor.nombre.toLowerCase()} {vendedor.apellido.toLowerCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold uppercase mr-2">{vendedor.tipoDocumento}</span>
                        {vendedor.numeroDocumento}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span>{vendedor.email || <span className="italic text-gray-400">—</span>}</span>
                          <span className="text-gray-500">
                            {vendedor.telefono || <span className="italic text-gray-400">—</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {vendedor.hotelesPermitidos?.length > 0 ? vendedor.hotelesPermitidos.map(h => (
                            <span key={h.id} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {h.nombre}
                            </span>
                          )) : <span className="italic text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <TableButton
                            variant="view"
                            icon={FileText}
                            onClick={() => navigate(`/admin/personal/liquidaciones/${vendedor.id}`)}
                            title="Ver Liquidaciones"
                          />
                          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(vendedor.id)} />
                          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(vendedor.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron vendedores que coincidan con la búsqueda.</p>
              </div>
            )}
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
