import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, User, History } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';

const ITEMS_PER_PAGE = 100;

const ClientesTable = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      toast.error(errorMsg, { id: 'fetch-error-cli' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await axiosInstance.delete(`/cliente/${id}`);
        setClientes(clientes.filter(c => c.id !== id));
        toast.success('Cliente eliminado');
      } catch (error) {
        toast.error('Error al eliminar cliente');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/clientes/editar/${id}`);
  };

  const handleHistory = (id) => {
    navigate(`/admin/clientes/${id}/historial`);
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(c =>
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroDocumento?.includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const currentItems = filteredClientes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda Interna */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="max-w-md">
            <SearchInput
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => setSearchTerm('')}
              disabled={loading}
            />
          </div>
        </div>

        <div className="relative flex flex-col flex-grow overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Hidratando base de clientes..." />
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
              {filteredClientes.length > 0 ? (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentItems.map((cliente) => (
                    <tr key={cliente.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center truncate">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4 truncate">
                            <div className="font-bold text-gray-900 dark:text-white transition-all max-w-[200px] truncate md:max-w-[300px]">
                              {capitalizeFirst(cliente.nombre)} {capitalizeFirst(cliente.apellido)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                        <span className="font-semibold uppercase mr-2">{cliente.tipoDocumento}</span>
                        {cliente.numeroDocumento}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {cliente.email || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                        {cliente.telefono || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <TableButton
                            variant="view"
                            icon={History}
                            onClick={() => handleHistory(cliente.id)}
                            title="Ver historial de alquileres"
                          />
                          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(cliente.id)} />
                          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(cliente.id)} />
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
                        <p>No se encontraron clientes que coincidan con la búsqueda.</p>
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
          totalItems={filteredClientes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ClientesTable;
