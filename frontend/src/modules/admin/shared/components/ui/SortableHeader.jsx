import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

/**
 * Encabezado de columna ordenable para tablas del módulo admin.
 * Muestra un indicador visual ↑ / ↓ / ↕ según el estado del sort.
 * El ↕ aparece solo al hacer hover en columnas inactivas.
 *
 * @param {string} column - Clave del campo para el sort (puede ser anidada: 'ubicacion.nombreCiudad')
 * @param {string} label - Texto visible del encabezado
 * @param {string} sortKey - Clave actualmente ordenada
 * @param {'asc'|'desc'} sortDir - Dirección actual del sort
 * @param {Function} onSort - Handler que recibe la clave al hacer click
 * @param {string} className - Clases adicionales
 */
export default function SortableHeader({ column, label, sortKey, sortDir, onSort, className = '' }) {
  const isActive = sortKey === column;

  return (
    <th
      className={`px-6 py-4 cursor-pointer select-none group ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span
          className={`flex-shrink-0 transition-opacity ${
            isActive ? 'opacity-100 text-blue-500 dark:text-blue-400' : 'opacity-0 group-hover:opacity-30'
          }`}
        >
          {isActive ? (
            sortDir === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
    </th>
  );
}
