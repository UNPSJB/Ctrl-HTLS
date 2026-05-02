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

      {/* Encabezado fijo (thead separado para asegurar buen scrolling en algunos layouts o thead sticky) */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/95 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
        <table className="w-full text-left text-sm">
          <thead className="text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:text-gray-400">
            <tr>
              {columns.map((col, idx) => {
                const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                const widthClass = col.width ? col.width : ''; // se puede pasar 'w-[10%]' u otra clase de ancho

                if (col.sortable !== false && onSort && col.key) {
                  return (
                    <SortableHeader
                      key={col.key || idx}
                      column={col.key}
                      label={col.label}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={onSort}
                      className={`${alignClass} ${widthClass}`}
                    />
                  );
                }

                return (
                  <th key={col.key || idx} className={`px-6 py-4 ${alignClass} ${widthClass}`}>
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
        </table>
      </div>

      {/* Cuerpo desplazable */}
      <div className="flex-grow overflow-auto custom-scrollbar">
        {!loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            {EmptyIcon && <EmptyIcon className="h-8 w-8 opacity-40 mb-2" />}
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            {/* Ocultamos el thead aquí pero lo renderizamos invisible para mantener los anchos correctos si no usamos table-fixed */}
            <thead className="invisible h-0">
              <tr>
                {columns.map((col, idx) => (
                  <th key={col.key || idx} className={col.width ? col.width : ''}></th>
                ))}
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
                      const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                      const cellContent = col.render ? col.render(row, rowIndex) : row[col.key];

                      return (
                        <td key={col.key || colIndex} className={`px-6 py-3 ${alignClass}`}>
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
