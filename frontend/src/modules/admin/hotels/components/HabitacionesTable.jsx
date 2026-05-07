import { useState } from 'react';
import {
  PowerOff,
  Edit2,
  DoorOpen,
  Layers,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { capitalizeFirst } from '@/utils/stringUtils';
import { DataTable, DataTableToolbar, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function HabitacionesTable({
  data = [],
  tiposGlobales = [],
  loading = false,
  isCreating = false,
  isTogglingRoom = false,
  onEdit,
  onDelete,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  // Estado del modal de confirmación de desactivación/activación
  const [habitacionToDelete, setHabitacionToDelete] = useState(null);

  // Filtro de estado: 'activas' | 'inactivas' | 'todas'
  const [statusFilter, setStatusFilter] = useState('activas');

  const STATUS_CYCLE = ['activas', 'inactivas', 'todas'];
  const STATUS_META = {
    activas: { label: 'Activas', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    inactivas: { label: 'Inactivas', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    todas: { label: 'Todas', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
  };

  const cycleStatus = () => {
    setStatusFilter(prev => {
      const idx = STATUS_CYCLE.indexOf(prev);
      return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    });
    setCurrentPage(1);
  };

  const enrichedData = data.map((hab) => ({
    ...hab,
    tipoNombre: (tiposGlobales.find((t) => t.id === Number(hab.tipoHabitacionId)) || hab.tipoHabitacion)?.nombre ?? '',
  }));

  const filteredData = enrichedData.filter(h => {
    if (statusFilter === 'activas') return !h.eliminado;
    if (statusFilter === 'inactivas') return h.eliminado;
    return true;
  });

  const { sortedData, sortKey, sortDir, handleSort } = useSort(filteredData, 'numero');

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirmDelete = async () => {
    if (!habitacionToDelete) return;
    await onDelete(habitacionToDelete.id, habitacionToDelete.tempId);
    setHabitacionToDelete(null);
  };

  const columns = [
    {
      key: 'numero',
      label: 'Habitación',
      render: (hab) => (
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <span className={hab.eliminado ? "text-gray-400" : "text-blue-600"}>#</span>
          {hab.eliminado ? <del>{hab.numero}</del> : hab.numero}
        </div>
      )
    },
    {
      key: 'piso',
      label: 'Ubicación',
      render: (hab) => (
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
          <Layers className="h-3 w-3" />
          Piso {hab.piso}
        </div>
      )
    },
    {
      key: 'tipoNombre',
      label: 'Categoría / Tipo',
      render: (hab) => {
        const tipo = tiposGlobales.find((t) => t.id === Number(hab.tipoHabitacionId)) || hab.tipoHabitacion;
        return (
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {tipo?.nombre ? capitalizeFirst(tipo.nombre) : 'Tipo no definido'}
          </span>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (hab) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="edit"
            icon={Edit2}
            onClick={() => onEdit(hab)}
            disabled={loading}
          />
          <TableButton
            variant={hab.eliminado ? "view" : "delete"}
            icon={hab.eliminado ? CheckCircle2 : PowerOff}
            onClick={() => setHabitacionToDelete(hab)}
            disabled={loading}
            title={hab.eliminado ? "Activar Habitación" : "Desactivar Habitación"}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTableToolbar className="justify-end py-3">
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={cycleStatus}
          disabled={loading}
          title={`Filtro actual: ${STATUS_META[statusFilter].label}. Click para cambiar.`}
          className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${STATUS_META[statusFilter].color
            } ${STATUS_META[statusFilter].bg
            } ${STATUS_META[statusFilter].border
            }`}
        >
          <Filter className="h-4 w-4 flex-shrink-0" />
          <span>{STATUS_META[statusFilter].label}</span>
        </button>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={currentItems}
        loading={loading && !isCreating}
        loadingMessage="Cargando inventario..."
        emptyIcon={DoorOpen}
        emptyMessage="No hay habitaciones físicas registradas en este hotel."
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        rowKey={(row) => row.id || row.tempId}
        rowClassName={(row) => row.eliminado
          ? '[&>td:not(:last-child)]:opacity-50 [&>td:not(:last-child)]:grayscale'
          : ''
        }
      />

      <DataTablePagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading}
      />

      <Modal
        isOpen={!!habitacionToDelete}
        onClose={() => setHabitacionToDelete(null)}
        title={habitacionToDelete?.eliminado ? "Activar Habitación" : "Desactivar Habitación"}
        onConfirm={handleConfirmDelete}
        loading={isTogglingRoom}
        confirmLabel={"Aceptar"}
        variant={habitacionToDelete?.eliminado ? "indigo" : "red"}
        size="sm"
      >
        {habitacionToDelete && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {habitacionToDelete.eliminado ? (
              <>¿Confirma la activación de la habitación <span className="font-semibold text-gray-900 dark:text-white">N° {habitacionToDelete.numero}</span>? Volverá a estar disponible para reservas.</>
            ) : (
              <>¿Confirma la desactivación de la habitación <span className="font-semibold text-gray-900 dark:text-white">N° {habitacionToDelete.numero}</span> (Piso {habitacionToDelete.piso})? La habitación dejará de estar disponible para reservas.</>
            )}
          </p>
        )}
      </Modal>
    </div>
  );
}
