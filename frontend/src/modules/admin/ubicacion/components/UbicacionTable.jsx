import { useState, useMemo } from 'react';
import { ChevronRight, Pencil, Trash2, ArrowRight, Search } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';

const PAGE_SIZE = 15;

function UbicacionTable({ tipo, items, loading, onEdit, onDelete, onDrillDown, drillDownLabel }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const hayDrillDown = typeof onDrillDown === 'function';

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (item.codigoPostal && item.codigoPostal.includes(search))
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={`Buscar ${tipo === 'pais' ? 'países' : tipo === 'provincia' ? 'provincias' : 'ciudades'}...`}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white placeholder:text-gray-400"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            <Search className="h-8 w-8 opacity-40" />
            <p className="text-sm">
              {search ? 'Sin resultados para esa búsqueda' : 'No hay registros todavía'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</th>
                {tipo === 'ciudad' && (
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Código Postal</th>
                )}
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {pageItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                >
                  <td className="px-6 py-3 text-gray-400 dark:text-gray-500 text-xs">
                    {(safePage - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {item.nombre}
                  </td>
                  {tipo === 'ciudad' && (
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {item.codigoPostal}
                    </td>
                  )}
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Editar */}
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => onDelete(item)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Ver hijos (drill-down) */}
                      {hayDrillDown && (
                        <button
                          onClick={() => onDrillDown(item)}
                          className="ml-1 flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/10 dark:hover:text-blue-400 transition-colors"
                          title={`Ver ${drillDownLabel}`}
                        >
                          {drillDownLabel}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      <TablePagination
        currentPage={page}
        totalItems={filtered.length}
        itemsPerPage={PAGE_SIZE}
        onPageChange={setPage}
        disabled={loading}
      />
    </div>
  );
}

export default UbicacionTable;
