import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Search, Plus, ChevronLeft, ChevronRight, X, CheckSquare, Square, DollarSign, FileText } from 'lucide-react';
import TableButton from '@ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { Loading } from '@ui/Loading';

const ITEMS_PER_PAGE = 10;

const VendedoresList = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para filtros y paginación
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
    navigate(`/admin/vendedores/editar/${id}`);
  };

  // Filtrado y Paginación
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
      await deleteVendedor(id);
    }
  };

  const deleteVendedor = async (id) => {
    try {
      await axiosInstance.delete(`/empleado/${id}`);
      setVendedores(prev => prev.filter((v) => v.id !== id));
      setSelectedIds(prev => prev.filter(selId => selId !== id));
    } catch (err) {
      alert(`Error al eliminar vendedor: ${err.response?.data?.error || 'Error desconocido'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} vendedores seleccionados?`)) {
      setLoading(true); // O mostrar un indicador de proceso
      for (const id of selectedIds) {
        await deleteVendedor(id);
      }
      setSelectedIds([]);
      setLoading(false);
      alert('Vendedores eliminados');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(v => v.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]); // Limpiar selección al cambiar búsqueda/filtro
  }, [searchTerm]);

  const handleCreate = () => {
    navigate('/admin/vendedores/nuevo');
  };

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Vendedores</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Listado y administración de fuerza de ventas</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/vendedores/liquidaciones"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <DollarSign className="h-4 w-4" />
            Liquidaciones
          </Link>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo Vendedor
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre, documento o email..."
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

        {/* Tabla / Loading */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando vendedores...</p>
              </div>
            </div>
          ) : filteredVendedores.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                  <th className="w-4 px-6 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Vendedor
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Documento
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Contacto
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Hoteles
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((vendedor) => (
                  <tr
                    key={vendedor.id}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedIds.includes(vendedor.id) ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(vendedor.id)}
                        onChange={() => toggleSelect(vendedor.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">
                          {vendedor.nombre.charAt(0)}{vendedor.apellido.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {vendedor.nombre} {vendedor.apellido}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {vendedor.rol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="uppercase font-bold text-xs mr-2 border rounded px-1">{vendedor.tipoDocumento}</span>
                      {vendedor.numeroDocumento}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>{vendedor.email}</div>
                      <div className="text-xs text-gray-500">{vendedor.telefono}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {vendedor.hotelesPermitidos && vendedor.hotelesPermitidos.length > 0 ? (
                          vendedor.hotelesPermitidos.slice(0, 3).map(h => (
                            <span key={h.id} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {h.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Ninguno</span>
                        )}
                        {vendedor.hotelesPermitidos && vendedor.hotelesPermitidos.length > 3 && (
                          <span className="text-xs text-gray-500">+{vendedor.hotelesPermitidos.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <TableButton
                          variant="view"
                          icon={FileText}
                          onClick={() => navigate(`/admin/vendedores/liquidaciones/${vendedor.id}`)}
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
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No se encontraron vendedores que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

        {/* Paginación */}
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
