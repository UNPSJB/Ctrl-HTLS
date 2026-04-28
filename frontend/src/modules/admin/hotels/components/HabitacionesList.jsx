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
import TablePagination from '@admin-ui/TablePagination';
import SortableHeader from '@admin-ui/SortableHeader';
import { InnerLoading } from '@/components/ui/InnerLoading';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function HabitacionesList({
  data = [],
  tiposGlobales = [],
  loading = false,
  isCreating = false,
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
    activas:  { label: 'Activas',   color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    inactivas:{ label: 'Inactivas', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    todas:    { label: 'Todas',     color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
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

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirmDelete = () => {
    if (!habitacionToDelete) return;
    onDelete(habitacionToDelete.id, habitacionToDelete.tempId);
    setHabitacionToDelete(null);
  };

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && !isCreating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Cargando inventario..." />
        </div>
      )}

      {/* Cabecera de tabla con filtro */}
      <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700 flex justify-end">
        <button
          type="button"
          onClick={cycleStatus}
          disabled={loading}
          title={`Filtro actual: ${STATUS_META[statusFilter].label}. Click para cambiar.`}
          className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
            STATUS_META[statusFilter].color
          } ${
            STATUS_META[statusFilter].bg
          } ${
            STATUS_META[statusFilter].border
          }`}
        >
          <Filter className="h-4 w-4 flex-shrink-0" />
          <span>{STATUS_META[statusFilter].label}</span>
        </button>
      </div>

      <div className="flex-grow overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <SortableHeader column="numero" label="Habitación" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader column="piso" label="Ubicación" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader column="tipoNombre" label="Categoría / Tipo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <DoorOpen className="h-8 w-8 text-gray-300" />
                    <p>No hay habitaciones físicas registradas en este hotel.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((habitacion) => {
                const tipo =
                  tiposGlobales.find(
                    (t) => t.id === Number(habitacion.tipoHabitacionId)
                  ) || habitacion.tipoHabitacion;
                return (
                  <tr
                    key={habitacion.id || habitacion.tempId}
                    className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30 ${habitacion.eliminado ? 'opacity-50 grayscale' : ''}`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <span className={habitacion.eliminado ? "text-gray-400" : "text-blue-600"}>#</span>
                        {habitacion.eliminado ? <del>{habitacion.numero}</del> : habitacion.numero}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Layers className="h-3 w-3" />
                        Piso {habitacion.piso}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {tipo?.nombre ? capitalizeFirst(tipo.nombre) : 'Tipo no definido'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <TableButton
                          variant="edit"
                          icon={Edit2}
                          onClick={() => onEdit(habitacion)}
                          disabled={loading || habitacion.eliminado}
                        />
                        <TableButton
                          variant={habitacion.eliminado ? "view" : "delete"}
                          icon={habitacion.eliminado ? CheckCircle2 : PowerOff}
                          onClick={() => setHabitacionToDelete(habitacion)}
                          disabled={loading}
                          title={habitacion.eliminado ? "Activar Habitación" : "Desactivar Habitación"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <TablePagination
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
        confirmLabel={habitacionToDelete?.eliminado ? "Sí, activar" : "Sí, desactivar"}
        confirmIcon={habitacionToDelete?.eliminado ? CheckCircle2 : PowerOff}
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
