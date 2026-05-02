import { useState } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function DescuentosTable({ data = [], loading = false, onDelete, isDeleting = false }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [descuentoToDelete, setDescuentoToDelete] = useState(null);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'cantidad_de_habitaciones');

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirmDelete = async () => {
    if (!descuentoToDelete) return;
    await onDelete?.(descuentoToDelete.id);
    setDescuentoToDelete(null);
  };

  const columns = [
    {
      key: 'cantidad_de_habitaciones',
      label: 'Mínimo de Habitaciones',
      render: (d) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {d.cantidad_de_habitaciones} {d.cantidad_de_habitaciones === 1 ? 'habitación' : 'habitaciones'}
        </span>
      )
    },
    {
      key: 'porcentaje',
      label: 'Descuento (%)',
      align: 'center',
      render: (d) => (
        <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          {(d.porcentaje * 100).toFixed(0)}%
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (d) => (
        <TableButton
          variant="delete"
          icon={Trash2}
          onClick={() => setDescuentoToDelete(d)}
          disabled={loading || !onDelete}
          title={onDelete ? 'Eliminar descuento' : 'Función no disponible aún'}
        />
      )
    }
  ];

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTable
        columns={columns}
        data={currentItems}
        loading={loading}
        loadingMessage="Sincronizando descuentos..."
        emptyIcon={Tag}
        emptyMessage="No hay descuentos configuradas."
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
        isOpen={!!descuentoToDelete}
        onClose={() => setDescuentoToDelete(null)}
        title="Eliminar Descuento"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        confirmLabel="Aceptar"
        variant="red"
        size="sm"
      >
        {descuentoToDelete && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Confirma la eliminación del descuento del{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{(descuentoToDelete.porcentaje * 100).toFixed(0)}%</span>{' '}
            para reservas de{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{descuentoToDelete.cantidad_de_habitaciones}</span>{' '}
            o más habitaciones?
          </p>
        )}
      </Modal>
    </div>
  );
}
