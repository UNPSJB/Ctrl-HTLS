import { useState, useMemo } from 'react';
import { ChevronRight, Pencil, Trash2, ArrowRight, Search } from 'lucide-react';
import TablePagination from '@admin-ui/TablePagination';
import TableButton from '@admin-ui/TableButton';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';

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
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Header bar: Breadcrumbs/Title + Buscar */}
        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            {headerContent}
          </div>
          <div className="w-full md:w-80">
            <SearchInput
              placeholder={`Buscar ${tipo === 'pais' ? 'países' : tipo === 'provincia' ? 'provincias' : 'ciudades'}...`}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onClear={() => handleSearch('')}
              disabled={loading}
            />
          </div>
        </div>

        <div className="relative flex flex-col flex-grow overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message={`Cargando ${tipo === 'pais' ? 'países' : tipo === 'provincia' ? 'provincias' : 'ciudades'}...`} />
            </div>
          )}

          <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Nombre</th>
                  {tipo === 'ciudad' && (
                    <th className="px-6 py-4">Código Postal</th>
                  )}
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              {!loading && pageItems.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={tipo === 'ciudad' ? 4 : 3}>
                      <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
                        <Search className="h-8 w-8 opacity-40 mb-2" />
                        <p className="text-sm">
                          {search ? 'Sin resultados para esa búsqueda' : 'No hay registros todavía'}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {pageItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                    >
                      <td className="px-6 py-3 text-gray-400 dark:text-gray-500 text-xs truncate">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {capitalizeFirst(item.nombre)}
                      </td>
                      {tipo === 'ciudad' && (
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs truncate">
                          {item.codigoPostal || <span className="italic opacity-50">—</span>}
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
              )}
            </table>
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
    </div>
  );
}

export default UbicacionTable;
