import { InnerLoading } from '@/components/ui/InnerLoading';
import SortableHeader from './SortableHeader';
import { capitalizeFirst } from '@/utils/stringUtils';

/**
 * Tabla de datos base para los listados del panel de administración.
 * Encapsula la estructura de contenedor, estado de carga, cabeceras (con o sin ordenamiento)
 * y el estado vacío (empty state).
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  loadingMessage = 'Cargando...',
  emptyIcon: EmptyIcon,
  emptyMessage = 'No hay resultados.',
  sortKey,
  sortDir,
  onSort,
  rowKey = (row) => row.id,
  rowClassName = () => '',
  onRowClick,
}) {
  return (
    <div className="relative flex flex-col flex-grow overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message={loadingMessage} />
        </div>
      )}

      {/* Tabla Unificada con Thead Sticky para alinear perfectamente las columnas y el scroll */}
      <div className="flex-grow overflow-auto custom-scrollbar">
        {!loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            {EmptyIcon && <EmptyIcon className="h-8 w-8 opacity-40 mb-2" />}
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm relative">
            <thead className="sticky top-0 z-10 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm bg-gray-50/95 backdrop-blur dark:bg-gray-800/95 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {columns.map((col, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === columns.length - 1;
                  let alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                  if (isFirst) alignClass = 'text-left';
                  if (isLast) alignClass = 'text-right';
                  
                  const paddingClass = isFirst ? 'pl-6 pr-4' : isLast ? 'pr-6 pl-4' : 'px-4';
                  const widthClass = col.width ? col.width : '';

                  if (col.sortable !== false && onSort && col.key) {
                    return (
                      <SortableHeader
                        key={col.key || idx}
                        column={col.key}
                        label={col.label}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={onSort}
                        className={`${alignClass} ${paddingClass} ${widthClass}`}
                      />
                    );
                  }

                  return (
                    <th key={col.key || idx} className={`py-4 ${alignClass} ${paddingClass} ${widthClass}`}>
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {data.map((row, rowIndex) => {
                const key = typeof rowKey === 'function' ? rowKey(row, rowIndex) : row[rowKey];
                const customClass = typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName;

                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20 ${onRowClick ? 'cursor-pointer' : ''} ${customClass}`}
                  >
                    {columns.map((col, colIndex) => {
                      const isFirst = colIndex === 0;
                      const isLast = colIndex === columns.length - 1;
                      let alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                      if (isFirst) alignClass = 'text-left';
                      if (isLast) alignClass = 'text-right';
                      
                      const paddingClass = isFirst ? 'pl-6 pr-4' : isLast ? 'pr-6 pl-4' : 'px-4';
                      const cellContent = col.render ? col.render(row, rowIndex) : row[col.key];

                      return (
                        <td key={col.key || colIndex} className={`py-3 ${alignClass} ${paddingClass}`}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
