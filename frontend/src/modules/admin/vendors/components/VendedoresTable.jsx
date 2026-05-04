import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, BarChart3, User, Users, Key, PowerOff, CheckCircle2, Filter } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination, Modal } from '@admin-ui';
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
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedVendedorId, setSelectedVendedorId] = useState(null);

  const [statusFilter, setStatusFilter] = useState('activos');
  const [vendedorToToggle, setVendedorToToggle] = useState(null);
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
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/vendedores');
      setVendedores(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
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
    let result = vendedores;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(v =>
        v.nombre.toLowerCase().includes(lowerTerm) ||
        v.apellido.toLowerCase().includes(lowerTerm) ||
        v.numeroDocumento.includes(lowerTerm) ||
        v.email.toLowerCase().includes(lowerTerm)
      );
    }
    if (statusFilter === 'activos') result = result.filter(v => !v.eliminado);
    if (statusFilter === 'inactivos') result = result.filter(v => v.eliminado);
    return result;
  }, [vendedores, searchTerm, statusFilter]);

  const { sortedData: sortedVendedores, sortKey, sortDir, handleSort } = useSort(filteredVendedores, 'apellido');

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedVendedores.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedVendedores]);

  const confirmToggle = async () => {
    if (!vendedorToToggle) return;
    setIsToggling(true);
    try {
      if (vendedorToToggle.eliminado) {
        // Reactivar: PUT con eliminado: false (compatible con nueva versión del backend)
        await axiosInstance.put(`/empleado/${vendedorToToggle.id}`, {
          nombre: vendedorToToggle.nombre,
          apellido: vendedorToToggle.apellido,
          email: vendedorToToggle.email,
          rol: vendedorToToggle.rol,
          telefono: vendedorToToggle.telefono,
          tipoDocumento: vendedorToToggle.tipoDocumento,
          numeroDocumento: vendedorToToggle.numeroDocumento,
          direccion: vendedorToToggle.direccion,
          ciudadId: vendedorToToggle.ubicacion?.ciudadId,
          eliminado: false,
        });
        toast.success('Vendedor reactivado correctamente');
      } else {
        await axiosInstance.delete(`/empleado/${vendedorToToggle.id}`);
        toast.success('Vendedor dado de baja');
      }
      await fetchVendedores();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar el estado del vendedor');
    } finally {
      setIsToggling(false);
      setVendedorToToggle(null);
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
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${vendedor.eliminado ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
            <User className="h-5 w-5" />
          </div>
          <div className="ml-4 truncate">
            <div className={`font-medium transition-all max-w-[200px] truncate md:max-w-[300px] ${vendedor.eliminado ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {vendedor.eliminado ? <del>{capitalizeFirst(vendedor.nombre)} {capitalizeFirst(vendedor.apellido)}</del> : `${capitalizeFirst(vendedor.nombre)} ${capitalizeFirst(vendedor.apellido)}`}
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
          <TableButton variant="view" icon={Key} onClick={() => handlePasswordChange(vendedor.id)} title="Cambiar Contraseña" disabled={vendedor.eliminado} />
          <TableButton
            variant="view"
            icon={BarChart3}
            onClick={() => navigate(`/admin/vendedores/liquidaciones/${vendedor.id}`)}
            title="Actividad y Liquidaciones"
            disabled={vendedor.eliminado}
          />
          <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(vendedor.id)} disabled={vendedor.eliminado} />
          <TableButton
            variant={!vendedor.eliminado ? "delete" : "view"}
            icon={!vendedor.eliminado ? PowerOff : CheckCircle2}
            onClick={() => setVendedorToToggle(vendedor)}
            title={!vendedor.eliminado ? "Dar de baja" : "Activar Vendedor"}
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
          loadingMessage="Cargando personal de ventas..."
          emptyIcon={Users}
          emptyMessage="No se encontraron vendedores que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          rowClassName={(v) => v.eliminado ? 'opacity-50 grayscale' : ''}
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

        <Modal
          isOpen={!!vendedorToToggle}
          onClose={() => setVendedorToToggle(null)}
          title={
            !vendedorToToggle?.eliminado && vendedorToToggle?.hotelesPermitidos?.length > 0
              ? "Acción no permitida"
              : vendedorToToggle?.eliminado ? "¿Reactivar Vendedor?" : "¿Dar de baja Vendedor?"
          }
          onConfirm={
            !vendedorToToggle?.eliminado && vendedorToToggle?.hotelesPermitidos?.length > 0
              ? () => setVendedorToToggle(null)
              : confirmToggle
          }
          loading={isToggling}
          confirmLabel={"Aceptar"}
          variant={
            !vendedorToToggle?.eliminado && vendedorToToggle?.hotelesPermitidos?.length > 0
              ? "default"
              : vendedorToToggle?.eliminado ? "default" : "red"
          }
        >
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {!vendedorToToggle?.eliminado && vendedorToToggle?.hotelesPermitidos?.length > 0 ? (
              <p>
                El vendedor <strong className="text-gray-900 dark:text-white font-medium">{vendedorToToggle ? `${capitalizeFirst(vendedorToToggle.nombre)} ${capitalizeFirst(vendedorToToggle.apellido)}` : ''}</strong> se encuentra actualmente asignado a uno o más hoteles. Para poder darlo de baja, primero debe revocar su acceso a todos los hoteles asociados.
              </p>
            ) : (
              <p>
                {vendedorToToggle?.eliminado ? 'Estás a punto de reactivar al vendedor ' : 'Estás a punto de dar de baja temporalmente al vendedor '}
                <strong className="text-gray-900 dark:text-white font-medium">
                  {vendedorToToggle ? `${capitalizeFirst(vendedorToToggle.nombre)} ${capitalizeFirst(vendedorToToggle.apellido)}` : ''}
                </strong>.
                {vendedorToToggle?.eliminado
                  ? ' Volverá a estar disponible para operar en el sistema.'
                  : ' No podrá realizar liquidaciones, gestionar hoteles ni acceder al sistema.'}
              </p>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default VendedoresTable;
