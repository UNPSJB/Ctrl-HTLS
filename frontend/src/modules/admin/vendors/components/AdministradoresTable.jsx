import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, User, Key } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import ChangePasswordModal from './ChangePasswordModal';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

const AdministradoresTable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/administradores');
      setAdmins(response.data);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      setError(errorMsg);
      toast.error(errorMsg, { id: 'fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
      try {
        await axiosInstance.delete(`/empleado/${id}`);
        setAdmins(prev => prev.filter((a) => a.id !== id));
      } catch (err) {
        alert('Error al eliminar administrador');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/administradores/editar/${id}`);
  };

  const handlePasswordChange = (id) => {
    setSelectedAdminId(id);
    setPasswordModalOpen(true);
  };

  const filteredAdmins = useMemo(() => {
    if (!searchTerm) return admins;
    const lowerTerm = searchTerm.toLowerCase();
    return admins.filter(a =>
      a.nombre.toLowerCase().includes(lowerTerm) ||
      a.apellido.toLowerCase().includes(lowerTerm) ||
      a.numeroDocumento.includes(lowerTerm)
    );
  }, [admins, searchTerm]);

  const { sortedData: sortedAdmins, sortKey, sortDir, handleSort } = useSort(filteredAdmins, 'apellido');

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAdmins.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedAdmins]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const columns = [
    {
      key: 'apellido',
      label: 'Nombre Completo',
      render: (admin) => (
        <div className="flex items-center truncate">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-4 truncate">
            <div className="font-medium text-gray-900 dark:text-white transition-all max-w-[200px] truncate md:max-w-[300px]">
              {capitalizeFirst(admin.nombre)} {capitalizeFirst(admin.apellido)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'numeroDocumento',
      label: 'Documento',
      render: (admin) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate block">
          <span className="font-semibold uppercase mr-2">{admin.tipoDocumento}</span>
          {admin.numeroDocumento}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (admin) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate block">
          {admin.email || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (admin) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate block">
          {admin.telefono || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (admin) => (
        <div className="flex justify-end gap-2">
          <TableButton variant="view" icon={Key} onClick={() => handlePasswordChange(admin.id)} title="Cambiar Contraseña" />
          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(admin.id)} />
          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(admin.id)} />
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
          loadingMessage="Consultando privilegios..."
          emptyIcon={User}
          emptyMessage="No se encontraron administradores que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />

        <DataTablePagination
          currentPage={currentPage}
          totalItems={sortedAdmins.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />

        <ChangePasswordModal 
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          empleadoId={selectedAdminId}
        />
      </div>
    </div>
  );
};

export default AdministradoresTable;
