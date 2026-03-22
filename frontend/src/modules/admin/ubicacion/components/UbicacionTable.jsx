import { useState, useMemo } from 'react';
import { ChevronRight, Pencil, Trash2, ArrowRight, Search } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableButton from '@/components/ui/TableButton';
import { InnerLoading } from '@/components/ui/InnerLoading';

const PAGE_SIZE = 15;

function UbicacionTable({ tipo, items, loading, onEdit, onDelete, onDrillDown, drillDownLabel, headerContent }) {
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



  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header bar: Breadcrumbs/Title + Buscar */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          {headerContent}
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
            placeholder={`Buscar ${tipo === 'pais' ? 'países' : tipo === 'provincia' ? 'provincias' : 'ciudades'}...`}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="relative flex min-h-[400px] flex-col overflow-hidden">
        {/* Espacio reservado para la tabla o el loader */}
        <div className="overflow-x-auto flex-1 flex flex-col h-full">
          {loading ? (
            <InnerLoading message={`Cargando ${tipo === 'pais' ? 'países' : tipo === 'provincia' ? 'provincias' : 'ciudades'}...`} />
          ) : pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <Search className="h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm">
                {search ? 'Sin resultados para esa búsqueda' : 'No hay registros todavía'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</th>
                  {tipo === 'ciudad' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Código Postal</th>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {pageItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                  >
                    <td className="px-6 py-3 text-gray-400 dark:text-gray-500 text-xs w-16">
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
                        <TableButton variant="edit" icon={Pencil} onClick={() => onEdit(item)} />
                        <TableButton variant="delete" icon={Trash2} onClick={() => onDelete(item)} />

                        {hayDrillDown && (
                          <button
                            onClick={() => onDrillDown(item)}
                            className="ml-2 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                            title={`Ver ${drillDownLabel}`}
                          >
                            <span>{drillDownLabel}</span>
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
