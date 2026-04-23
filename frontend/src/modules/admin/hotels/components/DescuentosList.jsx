import { useState } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import TablePagination from '@admin-ui/TablePagination';
import SortableHeader from '@admin-ui/SortableHeader';
import TableButton from '@admin-ui/TableButton';
import Modal from '@/components/ui/Modal';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

/**
 * Lista de descuentos por cantidad de habitaciones.
 * NOTA: El backend aún no expone DELETE para descuentos.
 * El botón está deshabilitado hasta que se pase el prop onDelete.
 */
export default function DescuentosList({ data = [], loading = false, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [descuentoToDelete, setDescuentoToDelete] = useState(null);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'cantidad_de_habitaciones');

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirmDelete = () => {
    if (!descuentoToDelete) return;
    onDelete?.(descuentoToDelete.id);
    setDescuentoToDelete(null);
  };

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Sincronizando descuentos..." />
        </div>
      )}
      <div className="flex-grow overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <SortableHeader column="cantidad_de_habitaciones" label="Mínimo de Habitaciones" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader column="porcentaje" label="Descuento (%)" className="text-center" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="h-8 w-8 opacity-20" />
                    <p>No hay descuentos configurados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {d.cantidad_de_habitaciones} {d.cantidad_de_habitaciones === 1 ? 'habitación' : 'habitaciones'}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {(d.porcentaje * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <TableButton
                      variant="delete"
                      icon={Trash2}
                      onClick={() => setDescuentoToDelete(d)}
                      disabled={loading || !onDelete}
                      title={onDelete ? 'Eliminar descuento' : 'Función no disponible aún'}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
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
        confirmLabel="Sí, eliminar"
        confirmIcon={Trash2}
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
