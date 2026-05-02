import { useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import { capitalizeFirst } from '@/utils/stringUtils';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function PersonalTable({
  data = [],
  loading = false,
  loadingAction = false,
  onDesasignar,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [vendedorToRemove, setVendedorToRemove] = useState(null);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'empleadoNombre');

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirmDesasignar = async () => {
    if (!vendedorToRemove) return;
    await onDesasignar(vendedorToRemove.empleadoId);
    setVendedorToRemove(null);
  };

  const columns = [
    {
      key: 'empleadoNombre',
      label: 'Nombre',
      render: (v) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {capitalizeFirst(v.empleadoNombre)} {capitalizeFirst(v.empleadoApellido)}
        </span>
      )
    },
    {
      key: 'empleadoNumeroDocumento',
      label: 'Documento',
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          <span className="mr-1 text-xs font-bold uppercase text-gray-400">
            {v.empleadoTipoDocumento || 'DNI'}
          </span>
          {v.empleadoNumeroDocumento}
        </span>
      )
    },
    {
      key: 'empleadoEmail',
      label: 'Email',
      render: (v) => (
        <span className="text-gray-600 dark:text-gray-300">
          {v.empleadoEmail || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (v) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="delete"
            icon={Trash2}
            onClick={() => setVendedorToRemove(v)}
            disabled={loadingAction || loading}
            title="Revocar Acceso"
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
        loading={loading || loadingAction}
        loadingMessage="Actualizando personal..."
        emptyIcon={Users}
        emptyMessage="No hay personal asignado actualmente."
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        rowKey={(row) => row.empleadoId}
      />

      <DataTablePagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading || loadingAction}
      />

      <Modal
        isOpen={!!vendedorToRemove}
        onClose={() => setVendedorToRemove(null)}
        title="Revocar Acceso"
        onConfirm={handleConfirmDesasignar}
        loading={loadingAction}
        confirmLabel="Confirmar"
        variant="red"
        size="sm"
      >
        {vendedorToRemove && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Confirma revocar el acceso de{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {capitalizeFirst(vendedorToRemove.empleadoNombre)} {capitalizeFirst(vendedorToRemove.empleadoApellido)}
            </span>{' '}
            a este hotel? El vendedor ya no podrá realizar reservas aquí.
          </p>
        )}
      </Modal>
    </div>
  );
}
