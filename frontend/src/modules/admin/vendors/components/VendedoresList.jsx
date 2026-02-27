import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, DollarSign, FileText, User, Users } from 'lucide-react';
import TableButton from '@/components/ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

const ITEMS_PER_PAGE = 10;

const VendedoresList = () => {
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

  const handleCreate = () => {
    navigate('/admin/personal/vendedores/nuevo');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

        {/* Barra de Acceso Rápido: Búsqueda y Botones al mismo nivel */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/personal/liquidaciones"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <DollarSign className="h-4 w-4 text-green-600" />
              Liquidaciones
            </Link>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Nuevo Vendedor
            </button>
          </div>
        </div>

        {/* Tabla Estándar */}
        <div className="overflow-x-auto min-h-[400px] flex flex-col">
          {loading ? (
            <InnerLoading message="Cargando personal de ventas..." />
          ) : filteredVendedores.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Personal</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Identificación</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contacto</th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Hoteles</th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((vendedor) => (
                  <tr key={vendedor.id} className="hover:bg-gray-50 transition-colors bg-white dark:bg-gray-800">
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="ml-4 text-sm">
                          <div className="font-medium text-gray-900 dark:text-white capitalize transition-all">
                            {vendedor.nombre.toLowerCase()} {vendedor.apellido.toLowerCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-bold border rounded px-1 text-[10px] mr-2">{vendedor.tipoDocumento}</span>
                      {vendedor.numeroDocumento}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <div>{vendedor.email}</div>
                      <div className="text-[11px] text-gray-500">{vendedor.telefono}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {vendedor.hotelesPermitidos?.map(h => (
                          <span key={h.id} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {h.nombre}
                          </span>
                        ))}
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron vendedores que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

        {/* Paginación Estándar */}
        {!loading && filteredVendedores.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredVendedores.length)}</span> de <span className="font-medium">{filteredVendedores.length}</span> resultados
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
    </div>
  );
};

export default VendedoresList;
