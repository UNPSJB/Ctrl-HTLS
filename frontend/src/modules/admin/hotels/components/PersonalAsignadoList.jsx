import { useState } from 'react';
import {
  Trash2,
  Users,
} from 'lucide-react';
import { capitalizeFirst } from '@/utils/stringUtils';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import TableButton from '@admin-ui/TableButton';

const ITEMS_PER_PAGE = 100;

export default function PersonalAsignadoList({
  data = [],
  loading = false,
  loadingAction = false,
  onDesasignar,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {(loading || loadingAction) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Actualizando personal..." />
        </div>
      )}

      <div className="flex-grow overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2 italic">
                    <Users className="h-8 w-8 opacity-20" />
                    <p>No hay personal asignado actualmente.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((v) => (
                <tr
                  key={v.empleadoId}
                  className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                >
                  <td className="whitespace-nowrap px-6 py-3 font-medium text-gray-900 dark:text-white">
                    {capitalizeFirst(v.empleadoNombre)} {capitalizeFirst(v.empleadoApellido)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-gray-600 dark:text-gray-300">
                    <span className="mr-1 text-xs font-bold uppercase text-gray-400">
                      {v.empleadoTipoDocumento || 'DNI'}
                    </span>
                    {v.empleadoNumeroDocumento}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {v.empleadoEmail || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <TableButton
                        variant="delete"
                        icon={Trash2}
                        onClick={() => onDesasignar(v.empleadoId)}
                        disabled={loadingAction || loading}
                        title="Revocar Acceso"
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
        totalItems={data.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading || loadingAction}
      />
    </div>
  );
}
