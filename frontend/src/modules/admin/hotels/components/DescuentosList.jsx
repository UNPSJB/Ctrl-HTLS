import { useState } from 'react';
import { Tag } from 'lucide-react';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';

const ITEMS_PER_PAGE = 100;

export default function DescuentosList({ data = [], loading = false }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="relative flex min-h-[160px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Sincronizando descuentos..." />
        </div>
      )}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Mínimo de Habitaciones</th>
              <th className="px-6 py-4 text-center">Descuento (%)</th>
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
        totalItems={data.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    </div>
  );
}
