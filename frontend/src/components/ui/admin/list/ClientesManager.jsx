import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import TableButton from '@ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { Loading } from '@ui/Loading';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

const ClientesManager = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/clientes');
      setClientes(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al cargar los clientes');
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    navigate(`/admin/clientes/editar/${cliente.id}`);
  };

  const handleCreate = () => {
    navigate('/admin/clientes/nuevo');
  };

  // Filtrado y Paginación
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes;
    const lowerTerm = searchTerm.toLowerCase();

    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(lowerTerm) ||
      c.apellido.toLowerCase().includes(lowerTerm) ||
      c.numeroDocumento.includes(lowerTerm) ||
      (c.email && c.email.toLowerCase().includes(lowerTerm))
    );
  }, [clientes, searchTerm]);

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClientes.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredClientes]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      await deleteCliente(id);
    }
  };

  const deleteCliente = async (id) => {
    try {
      await axiosInstance.delete(`/cliente/${id}`);
      setClientes(prev => prev.filter((c) => c.id !== id));
      setSelectedIds(prev => prev.filter(selId => selId !== id));
      toast.success('Cliente eliminado');
    } catch (err) {
      console.error(err);
      toast.error(`Error al eliminar: ${err.response?.data?.error || 'Error desconocido'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} clientes seleccionados?`)) {
      setLoading(true);
      let deletedCount = 0;
      for (const id of selectedIds) {
        try {
          await axiosInstance.delete(`/cliente/${id}`);
          deletedCount++;
        } catch (error) {
          console.error(`Error eliminando cliente ${id}`, error);
        }
      }

      // Refetch or update state
      if (deletedCount > 0) {
        setClientes(prev => prev.filter(c => !selectedIds.includes(c.id)));
        toast.success(`${deletedCount} clientes eliminados`);
      }
      setSelectedIds([]);
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Administración de base de clientes</p>
        </div>
        <div className="flex gap-2">
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
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre, documento..."
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
        {/* Tabla / Loading */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando clientes...</p>
              </div>
            </div>
          ) : filteredClientes.length > 0 ? (
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
                    Cliente
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Documento
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Contacto
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedIds.includes(cliente.id) ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(cliente.id)}
                        onChange={() => toggleSelect(cliente.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">
                          {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {cliente.nombre} {cliente.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="uppercase font-bold text-xs mr-2 border rounded px-1">{cliente.tipoDocumento}</span>
                      {cliente.numeroDocumento}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>{cliente.email}</div>
                      <div className="text-xs text-gray-500">{cliente.telefono}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(cliente)} />
                        <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(cliente.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && filteredClientes.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredClientes.length)}</span> de <span className="font-medium">{filteredClientes.length}</span> resultados
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

export default ClientesManager;
