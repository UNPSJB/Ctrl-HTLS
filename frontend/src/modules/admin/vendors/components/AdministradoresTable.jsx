import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, User, Key, PowerOff, CheckCircle2, Filter } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination, Modal } from '@admin-ui';
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
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const [statusFilter, setStatusFilter] = useState('activos');
  const [adminToToggle, setAdminToToggle] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const STATUS_CYCLE = ['activos', 'inactivos', 'todos'];
  const STATUS_META = {
    activos: { label: 'Activos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    inactivos: { label: 'Inactivos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    todos: { label: 'Todos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
  };

  const cycleStatus = () => {
    setStatusFilter(prev => {
      const idx = STATUS_CYCLE.indexOf(prev);
      return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/administradores');
      setAdmins(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      toast.error(errorMsg, { id: 'fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmToggle = async () => {
    if (!adminToToggle) return;
    setIsToggling(true);
    try {
      if (adminToToggle.eliminado) {
        // Reactivar: PUT con eliminado: false (compatible con nueva versión del backend)
        await axiosInstance.put(`/administrador/${adminToToggle.id}`, {
          nombre: adminToToggle.nombre,
          apellido: adminToToggle.apellido,
          email: adminToToggle.email,
          rol: 'administrador',
          telefono: adminToToggle.telefono,
          tipoDocumento: adminToToggle.tipoDocumento,
          numeroDocumento: adminToToggle.numeroDocumento,
          direccion: adminToToggle.direccion,
          ciudadId: adminToToggle.ubicacion?.ciudadId,
          eliminado: false,
        });
        toast.success('Administrador reactivado correctamente');
      } else {
        await axiosInstance.delete(`/empleado/${adminToToggle.id}`);
        toast.success('Administrador dado de baja');
      }
      await fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar el estado del administrador');
    } finally {
      setIsToggling(false);
      setAdminToToggle(null);
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
    let result = admins;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.nombre.toLowerCase().includes(lowerTerm) ||
        a.apellido.toLowerCase().includes(lowerTerm) ||
        a.numeroDocumento.includes(lowerTerm)
      );
    }
    if (statusFilter === 'activos') result = result.filter(a => !a.eliminado);
    if (statusFilter === 'inactivos') result = result.filter(a => a.eliminado);
    return result;
  }, [admins, searchTerm, statusFilter]);

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
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${admin.eliminado ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
            <User className="h-5 w-5" />
          </div>
          <div className="ml-4 truncate">
            <div className={`font-medium transition-all max-w-[200px] truncate md:max-w-[300px] ${admin.eliminado ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {admin.eliminado ? <del>{capitalizeFirst(admin.nombre)} {capitalizeFirst(admin.apellido)}</del> : `${capitalizeFirst(admin.nombre)} ${capitalizeFirst(admin.apellido)}`}
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
          <TableButton variant="view" icon={Key} onClick={() => handlePasswordChange(admin.id)} title="Cambiar Contraseña" disabled={admin.eliminado} />
          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(admin.id)} disabled={admin.eliminado} />
          <TableButton
            variant={!admin.eliminado ? "delete" : "view"}
            icon={!admin.eliminado ? PowerOff : CheckCircle2}
            onClick={() => setAdminToToggle(admin)}
            title={!admin.eliminado ? "Dar de baja" : "Activar Administrador"}
          />
        </div>
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <DataTableToolbar>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={cycleStatus}
              disabled={loading}
              title={`Filtro actual: ${STATUS_META[statusFilter].label}. Click para cambiar.`}
              className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${STATUS_META[statusFilter].color} ${STATUS_META[statusFilter].bg} ${STATUS_META[statusFilter].border}`}
            >
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{STATUS_META[statusFilter].label}</span>
            </button>
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
          rowClassName={(a) => a.eliminado ? 'opacity-50 grayscale' : ''}
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

        <Modal
          isOpen={!!adminToToggle}
          onClose={() => setAdminToToggle(null)}
          title={adminToToggle?.eliminado ? "¿Reactivar Administrador?" : "¿Dar de baja Administrador?"}
          onConfirm={confirmToggle}
          loading={isToggling}
          confirmLabel={"Aceptar"}
          variant={adminToToggle?.eliminado ? "default" : "red"}
        >
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              {adminToToggle?.eliminado ? 'Estás a punto de reactivar al administrador ' : 'Estás a punto de dar de baja temporalmente al administrador '}
              <strong className="text-gray-900 dark:text-white font-medium">
                {adminToToggle ? `${capitalizeFirst(adminToToggle.nombre)} ${capitalizeFirst(adminToToggle.apellido)}` : ''}
              </strong>.
              {adminToToggle?.eliminado
                ? ' Volverá a tener acceso total al sistema de administración.'
                : ' Su acceso al panel de administración será revocado.'}
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdministradoresTable;
