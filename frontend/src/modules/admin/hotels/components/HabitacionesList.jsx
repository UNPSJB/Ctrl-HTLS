import { useState } from 'react';
import {
  Trash2,
  Edit2,
  DoorOpen,
  Layers,
} from 'lucide-react';
import { capitalizeFirst } from '@/utils/stringUtils';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import TableButton from '@admin-ui/TableButton';

const ITEMS_PER_PAGE = 100;

export default function HabitacionesList({
  data = [],
  tiposGlobales = [],
  loading = false,
  isCreating = false,
  onEdit,
  onDelete,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="relative flex flex-col min-h-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && !isCreating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Cargando inventario..." />
        </div>
      )}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Habitación</th>
              <th className="px-6 py-4">Ubicación</th>
              <th className="px-6 py-4">Categoría / Tipo</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <DoorOpen className="h-8 w-8 text-gray-300" />
                    <p>No hay habitaciones físicas registradas en este hotel.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((habitacion) => {
                const tipo =
                  tiposGlobales.find(
                    (t) => t.id === Number(habitacion.tipoHabitacionId)
                  ) || habitacion.tipoHabitacion;
                return (
                  <tr
                    key={habitacion.id || habitacion.tempId}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <span className="text-blue-600">#</span>
                        {habitacion.numero}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Layers className="h-3 w-3" />
                        Piso {habitacion.piso}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {tipo?.nombre ? capitalizeFirst(tipo.nombre) : 'Tipo no definido'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <TableButton
                          variant="edit"
                          icon={Edit2}
                          onClick={() => onEdit(habitacion)}
                          disabled={loading}
                        />
                        <TableButton
                          variant="delete"
                          icon={Trash2}
                          onClick={() => onDelete(habitacion.id, habitacion.tempId)}
                          disabled={loading}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
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
