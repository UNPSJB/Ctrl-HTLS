import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Users, User, Edit, Filter } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useSort } from '@/hooks/useSort';
import { Modal } from '@admin-ui';

const ITEMS_PER_PAGE = 100;

const EncargadosTable = () => {
  const [encargados, setEncargados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [assignFilter, setAssignFilter] = useState('asignados');
  const [encargadoToDelete, setEncargadoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const ASSIGN_CYCLE = ['asignados', 'libres', 'todos'];
  const ASSIGN_META = {
    asignados: { label: 'Con hotel', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    libres: { label: 'Sin hotel', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    todos: { label: 'Todos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
  };
  const cycleAssign = () => {
    setAssignFilter(prev => {
      const idx = ASSIGN_CYCLE.indexOf(prev);
      return ASSIGN_CYCLE[(idx + 1) % ASSIGN_CYCLE.length];
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchEncargados();
  }, []);

  const fetchEncargados = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hotel/encargados');
      setEncargados(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      toast.error(errorMsg, { id: 'fetch-error-enc' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (encargado) => {
    setEncargadoToDelete(encargado);
  };

  const confirmDelete = async () => {
    if (!encargadoToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/hotel/encargados/${encargadoToDelete.id}`);
      setEncargados(encargados.filter(e => e.id !== encargadoToDelete.id));
      toast.success('Encargado eliminado');
      setEncargadoToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar encargado');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEncargados = useMemo(() => {
    let result = encargados.filter(e =>
      e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.dni?.includes(searchTerm)
    );
    if (assignFilter === 'asignados') result = result.filter(e => !!e.hotel);
    if (assignFilter === 'libres') result = result.filter(e => !e.hotel);
    return result;
  }, [encargados, searchTerm, assignFilter]);

  const { sortedData: sortedEncargados, sortKey, sortDir, handleSort } = useSort(filteredEncargados, 'nombre');

  const currentItems = sortedEncargados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre Completo',
      render: (encargado) => (
        <div className="flex items-center truncate">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-4 truncate">
            <div className="text-sm font-medium text-gray-900 dark:text-white transition-all max-w-[200px] truncate md:max-w-[300px]">
              {capitalizeFirst(encargado.nombre)} {capitalizeFirst(encargado.apellido)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'dni',
      label: 'Documento',
      render: (encargado) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate block">
          <span className="font-semibold uppercase mr-2">
            {encargado.tipoDocumento}
          </span>
          {encargado.dni}
        </span>
      )
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (encargado) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate block">
          {encargado.telefono || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'hotel.nombre',
      label: 'Hotel',
      render: (encargado) => (
        <span className="truncate max-w-[200px] md:max-w-[250px] block">
          {encargado.hotel ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-full">
              {capitalizeFirst(encargado.hotel.nombre)}
            </span>
          ) : (
            <span className="italic text-gray-400">—</span>
          )}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (encargado) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="edit"
            icon={Edit}
            onClick={() => navigate(`/admin/encargados/editar/${encargado.id}`)}
          />
          <TableButton variant="delete" icon={Trash2} onClick={() => handleDeleteClick(encargado)} />
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
              onClick={cycleAssign}
              disabled={loading}
              title={`Filtro: ${ASSIGN_META[assignFilter].label}. Click para cambiar.`}
              className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${ASSIGN_META[assignFilter].color
                } ${ASSIGN_META[assignFilter].bg
                } ${ASSIGN_META[assignFilter].border
                }`}
            >
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{ASSIGN_META[assignFilter].label}</span>
            </button>
          </div>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          loadingMessage="Cargando encargados..."
          emptyIcon={Users}
          emptyMessage="No se encontraron encargados que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />

        <DataTablePagination
          currentPage={currentPage}
          totalItems={sortedEncargados.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>

      <Modal
        isOpen={!!encargadoToDelete}
        onClose={() => setEncargadoToDelete(null)}
        title={encargadoToDelete?.hotel ? "Acción no permitida" : "Eliminar Encargado"}
        onConfirm={encargadoToDelete?.hotel ? () => setEncargadoToDelete(null) : confirmDelete}
        loading={isDeleting}
        confirmLabel={"Aceptar"}
        variant={encargadoToDelete?.hotel ? "default" : "red"}
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          {encargadoToDelete?.hotel ? (
            <p>
              El encargado <strong className="text-gray-900 dark:text-white font-medium">{capitalizeFirst(encargadoToDelete.nombre)} {capitalizeFirst(encargadoToDelete.apellido)}</strong> se encuentra actualmente asignado al hotel <strong className="text-gray-900 dark:text-white font-medium">{capitalizeFirst(encargadoToDelete.hotel.nombre)}</strong>. No puede ser eliminado hasta que sea desvinculado de dicho hotel.
            </p>
          ) : (
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente al encargado <strong className="text-gray-900 dark:text-white font-medium">{encargadoToDelete ? `${capitalizeFirst(encargadoToDelete.nombre)} ${capitalizeFirst(encargadoToDelete.apellido)}` : ''}</strong>?
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EncargadosTable;
