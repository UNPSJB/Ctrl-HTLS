import { useState } from 'react';
import { Calendar, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatFecha } from '@/utils/dateUtils';
import TablePagination from '@admin-ui/TablePagination';
import SortableHeader from '@admin-ui/SortableHeader';
import { InnerLoading } from '@/components/ui/InnerLoading';
import TableButton from '@admin-ui/TableButton';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

export default function TemporadasList({ data = [], loading = false, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'fechaInicio');

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Sincronizando temporadas..." />
        </div>
      )}
      <div className="flex-grow overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <SortableHeader column="tipo" label="Tipo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader column="fechaInicio" label="Inicio" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader column="fechaFin" label="Fin" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader column="porcentaje" label="Ajuste" className="text-center" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 opacity-20" />
                    <p>No hay temporadas configuradas.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((t) => (
                <tr key={t.id} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-3">
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
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatFecha(t.fechaInicio)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatFecha(t.fechaFin)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {(t.porcentaje * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <TableButton
                        variant="delete"
                        icon={Trash2}
                        onClick={() => onDelete(t.id)}
                        disabled={loading}
                      />
                    </div>
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
