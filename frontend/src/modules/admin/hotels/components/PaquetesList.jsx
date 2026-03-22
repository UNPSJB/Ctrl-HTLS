import { useState } from 'react';
import { Tag, Info, BedDouble } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';

const ITEMS_PER_PAGE = 100;

export default function PaquetesList({ data = [], loading = false }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="relative flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Sincronizando paquetes..." />
        </div>
      )}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Nombre Paquete</th>
              <th className="px-6 py-4 text-center">Desde</th>
              <th className="px-6 py-4 text-center">Hasta</th>
              <th className="px-6 py-4 text-center">Descuento</th>
              <th className="px-6 py-4">Habitaciones</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 && !loading ? (
              <tr key="empty-packages">
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Tag className="h-8 w-8 opacity-20" />
                    <p>No se han configurado paquetes promocionales.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((paquete, pIdx) => (
                <tr key={paquete.id || `pkg-${pIdx}`} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {paquete.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {new Date(paquete.fecha_inicio).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {new Date(paquete.fecha_fin).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {Math.abs(Math.round(paquete.coeficiente_descuento * 100))}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:bg-gray-800" title="Edición en desarrollo por backend">
                      <Info className="h-3.5 w-3.5" />
                      No editable
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
