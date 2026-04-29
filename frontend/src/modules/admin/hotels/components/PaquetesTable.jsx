import { useState } from 'react';
import { Tag, BedDouble, Edit, Trash2 } from 'lucide-react';
import { capitalizeFirst } from '@/utils/stringUtils';
import { formatFecha } from '@/utils/dateUtils';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

/**
 * Lista de paquetes turísticos con acciones de editar y eliminar.
 * Recibe callbacks onEdit y onDelete desde PaquetesTab.
 */
export default function PaquetesTable({ data = [], loading = false, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paqueteToDelete, setPaqueteToDelete] = useState(null);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'nombre');

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre Paquete',
      render: (paquete) => (
        <div className="font-bold text-gray-900 dark:text-white transition-all">
          {capitalizeFirst(paquete.nombre)}
        </div>
      )
    },
    {
      key: 'fecha_inicio',
      label: 'Desde',
      align: 'center',
      render: (paquete) => (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
          {formatFecha(paquete.fecha_inicio)}
        </span>
      )
    },
    {
      key: 'fecha_fin',
      label: 'Hasta',
      align: 'center',
      render: (paquete) => (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
          {formatFecha(paquete.fecha_fin)}
        </span>
      )
    },
    {
      key: 'coeficiente_descuento',
      label: 'Descuento',
      align: 'center',
      render: (paquete) => (
        <span className="text-gray-900 dark:text-gray-300">
          {Math.abs(Math.round(paquete.coeficiente_descuento * 100))}%
        </span>
      )
    },
    {
      key: 'habitaciones',
      label: 'Habitaciones',
      sortable: false,
      render: (paquete) => (
        <div className="custom-scrollbar flex max-h-24 flex-col gap-1 overflow-y-auto pr-2">
          {paquete.habitaciones && paquete.habitaciones.length > 0 ? (
            paquete.habitaciones.map((hab, hIdx) => (
              <div key={hab.id || `pkg-hab-${hIdx}`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <BedDouble className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="whitespace-nowrap font-medium">Piso {hab.piso} - N° {hab.numero}</span>
              </div>
            ))
          ) : (
            <span className="text-xs italic text-gray-400">—</span>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (paquete) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="edit"
            icon={Edit}
            onClick={() => onEdit?.(paquete)}
            title="Editar paquete"
          />
          <TableButton
            variant="delete"
            icon={Trash2}
            onClick={() => setPaqueteToDelete(paquete)}
            title="Eliminar paquete"
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
        loadingMessage="Sincronizando paquetes..."
        emptyIcon={Tag}
        emptyMessage="No se han configurado paquetes turísticos."
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
        isOpen={!!paqueteToDelete}
        onClose={() => setPaqueteToDelete(null)}
        title="Eliminar Paquete"
        onConfirm={() => {
          onDelete?.(paqueteToDelete.id);
          setPaqueteToDelete(null);
        }}
        confirmLabel="Sí, eliminar"
        confirmIcon={Trash2}
        variant="red"
        size="sm"
      >
        {paqueteToDelete && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Confirma la eliminación del paquete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">"{capitalizeFirst(paqueteToDelete.nombre)}"</span>?
            Esta acción no se puede deshacer.
          </p>
        )}
      </Modal>
    </div>
  );
}
