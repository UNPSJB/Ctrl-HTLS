import { useState } from 'react';
import { Calendar, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatFecha } from '@/utils/dateUtils';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function TemporadasTable({ data = [], loading = false, onDelete, isDeleting = false }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [temporadaToDelete, setTemporadaToDelete] = useState(null);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'fechaInicio');

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirmDelete = async () => {
    if (!temporadaToDelete) return;
    await onDelete(temporadaToDelete.id);
    setTemporadaToDelete(null);
  };

  const columns = [
    {
      key: 'tipo',
      label: 'Tipo',
      render: (t) => (
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          {t.tipo === 'alta' ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-orange-500" />
          )}
          <span className={t.tipo === 'alta' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}>
            {t.tipo}
          </span>
        </div>
      )
    },
    {
      key: 'fechaInicio',
      label: 'Inicio',
      render: (t) => (
        <span className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          {formatFecha(t.fechaInicio)}
        </span>
      )
    },
    {
      key: 'fechaFin',
      label: 'Fin',
      render: (t) => (
        <span className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          {formatFecha(t.fechaFin)}
        </span>
      )
    },
    {
      key: 'porcentaje',
      label: 'Ajuste',
      align: 'center',
      render: (t) => (
        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {(t.porcentaje * 100).toFixed(0)}%
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (t) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="delete"
            icon={Trash2}
            onClick={() => setTemporadaToDelete(t)}
            disabled={loading}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTable
        columns={columns}
        data={currentItems}
        loading={loading}
        loadingMessage="Sincronizando temporadas..."
        emptyIcon={Calendar}
        emptyMessage="No hay temporadas configuradas."
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <DataTablePagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading}
      />

      <Modal
        isOpen={!!temporadaToDelete}
        onClose={() => setTemporadaToDelete(null)}
        title="Eliminar Temporada"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        confirmLabel="Aceptar"
        variant="red"
        size="sm"
      >
        {temporadaToDelete && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Confirma la eliminación de la temporada de{' '}
            <span className="font-semibold text-gray-900 dark:text-white capitalize">{temporadaToDelete.tipo}</span>{' '}
            del{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{formatFecha(temporadaToDelete.fechaInicio)}</span>{' '}
            al{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{formatFecha(temporadaToDelete.fechaFin)}</span>?
            Esta acción no se puede deshacer.
          </p>
        )}
      </Modal>
    </div>
  );
}
