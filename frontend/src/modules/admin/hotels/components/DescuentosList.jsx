import { useState } from 'react';
import { Tag } from 'lucide-react';
import TablePagination from '@admin-ui/TablePagination';
import SortableHeader from '@admin-ui/SortableHeader';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function DescuentosList({ data = [], loading = false }) {
  const [currentPage, setCurrentPage] = useState(1);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'cantidad_de_habitaciones');

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan="2" className="px-6 py-12 text-center text-gray-400 italic">
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
                </tr>
              ))
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
    </div>
  );
}
