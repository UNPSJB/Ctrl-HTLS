import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, User, History } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useSort } from '@/hooks/useSort';

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

  const { sortedData: sortedClientes, sortKey, sortDir, handleSort } = useSort(filteredClientes, 'apellido');

  const currentItems = sortedClientes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'apellido',
      label: 'Nombre Completo',
      render: (cliente) => (
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
      )
    },
    {
      key: 'numeroDocumento',
      label: 'Documento',
      render: (cliente) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate block">
          <span className="font-semibold uppercase mr-2">{cliente.tipoDocumento}</span>
          {cliente.numeroDocumento}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (cliente) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate block">
          {cliente.email || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (cliente) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate block">
          {cliente.telefono || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (cliente) => (
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
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <DataTableToolbar>
          <div className="w-full max-w-md">
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
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          loadingMessage="Hidratando base de clientes..."
          emptyIcon={Users}
          emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />

        <DataTablePagination
          currentPage={currentPage}
          totalItems={sortedClientes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ClientesTable;
