import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, BarChart3, User, Users, Key } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import ChangePasswordModal from './ChangePasswordModal';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

const VendedoresTable = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedVendedorId, setSelectedVendedorId] = useState(null);

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

  const handlePasswordChange = (id) => {
    setSelectedVendedorId(id);
    setPasswordModalOpen(true);
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

  const { sortedData: sortedVendedores, sortKey, sortDir, handleSort } = useSort(filteredVendedores, 'apellido');

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedVendedores.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedVendedores]);

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

  const columns = [
    {
      key: 'apellido',
      label: 'Nombre Completo',
      render: (vendedor) => (
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
      )
    },
    {
      key: 'numeroDocumento',
      label: 'Documento',
      render: (vendedor) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate block">
          <span className="font-semibold uppercase mr-2">{vendedor.tipoDocumento}</span>
          {vendedor.numeroDocumento}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (vendedor) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate block">
          {vendedor.email || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (vendedor) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate block">
          {vendedor.telefono || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (vendedor) => (
        <div className="flex justify-end gap-2">
          <TableButton variant="view" icon={Key} onClick={() => handlePasswordChange(vendedor.id)} title="Cambiar Contraseña" />
          <TableButton
            variant="view"
            icon={BarChart3}
            onClick={() => navigate(`/admin/vendedores/liquidaciones/${vendedor.id}`)}
            title="Actividad y Liquidaciones"
          />
          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(vendedor.id)} />
          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(vendedor.id)} />
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
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              disabled={loading}
            />
          </div>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          loadingMessage="Cargando personal de ventas..."
          emptyIcon={Users}
          emptyMessage="No se encontraron vendedores que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />

        <DataTablePagination
          currentPage={currentPage}
          totalItems={sortedVendedores.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />

        <ChangePasswordModal 
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          empleadoId={selectedVendedorId}
        />
      </div>
    </div>
  );
};

export default VendedoresTable;
