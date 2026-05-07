import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, User, History, PowerOff, CheckCircle2, Filter } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination, Modal } from '@admin-ui';
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

  const [statusFilter, setStatusFilter] = useState('activos');
  const [clienteToToggle, setClienteToToggle] = useState(null);
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
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      toast.error(errorMsg, { id: 'fetch-error-cli' });
    } finally {
      setLoading(false);
    }
  };

  const confirmToggle = async () => {
    if (!clienteToToggle) return;
    setIsToggling(true);
    try {
      if (clienteToToggle.eliminado) {
        // Reactivar: PUT con eliminado: false (compatible con nueva versión del backend)
        await axiosInstance.put(`/cliente/${clienteToToggle.id}`, {
          nombre: clienteToToggle.nombre,
          apellido: clienteToToggle.apellido,
          email: clienteToToggle.email,
          telefono: clienteToToggle.telefono,
          tipoDocumento: clienteToToggle.tipoDocumento,
          numeroDocumento: clienteToToggle.numeroDocumento,
          puntos: clienteToToggle.puntos,
          eliminado: false,
        });
        toast.success('Cliente reactivado correctamente');
      } else {
        await axiosInstance.delete(`/cliente/${clienteToToggle.id}`);
        toast.success('Cliente dado de baja');
      }
      await fetchClientes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar el estado del cliente');
    } finally {
      setIsToggling(false);
      setClienteToToggle(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/clientes/editar/${id}`);
  };

  const handleHistory = (id) => {
    navigate(`/admin/clientes/${id}/historial`);
  };

  const filteredClientes = useMemo(() => {
    let result = clientes.filter(c =>
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroDocumento?.includes(searchTerm)
    );
    if (statusFilter === 'activos') result = result.filter(c => !c.eliminado);
    if (statusFilter === 'inactivos') result = result.filter(c => c.eliminado);
    return result;
  }, [clientes, searchTerm, statusFilter]);

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
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${cliente.eliminado ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            <User className="h-5 w-5" />
          </div>
          <div className="ml-4 truncate">
            <div className={`font-bold transition-all max-w-[200px] truncate md:max-w-[300px] ${cliente.eliminado ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {cliente.eliminado ? <del>{capitalizeFirst(cliente.nombre)} {capitalizeFirst(cliente.apellido)}</del> : `${capitalizeFirst(cliente.nombre)} ${capitalizeFirst(cliente.apellido)}`}
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
          <TableButton
            variant={!cliente.eliminado ? "delete" : "view"}
            icon={!cliente.eliminado ? PowerOff : CheckCircle2}
            onClick={() => setClienteToToggle(cliente)}
            title={!cliente.eliminado ? "Dar de baja" : "Activar Cliente"}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
          loadingMessage="Hidratando base de clientes..."
          emptyIcon={Users}
          emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          rowClassName={(c) => c.eliminado
            ? '[&>td:not(:last-child)]:opacity-50 [&>td:not(:last-child)]:grayscale'
            : ''
          }
        />

        <DataTablePagination
          currentPage={currentPage}
          totalItems={sortedClientes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />

        <Modal
          isOpen={!!clienteToToggle}
          onClose={() => setClienteToToggle(null)}
          title={clienteToToggle?.eliminado ? "¿Reactivar Cliente?" : "¿Dar de baja Cliente?"}
          onConfirm={confirmToggle}
          loading={isToggling}
          confirmLabel={"Aceptar"}
          variant={clienteToToggle?.eliminado ? "default" : "red"}
        >
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              {clienteToToggle?.eliminado ? 'Estás a punto de reactivar al cliente ' : 'Estás a punto de dar de baja temporalmente al cliente '}
              <strong className="text-gray-900 dark:text-white font-medium">
                {clienteToToggle ? `${capitalizeFirst(clienteToToggle.nombre)} ${capitalizeFirst(clienteToToggle.apellido)}` : ''}
              </strong>.
              {clienteToToggle?.eliminado
                ? ' Volverá a estar disponible para realizar reservas y operar en el sistema.'
                : ' No podrá ser seleccionado ni participará operativamente hasta que sea reactivado.'}
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ClientesTable;
