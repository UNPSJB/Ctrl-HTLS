import { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';

/**
 * Panel reutilizable para mostrar una lista de ubicaciones (países, provincias o ciudades).
 * Se usa 3 veces en UbicacionPage, una por cada nivel de la jerarquía.
 *
 * @param {Object} props
 * @param {string} props.title - Título del panel (ej: "Países")
 * @param {import('lucide-react').LucideIcon} props.icon - Ícono del panel
 * @param {string} props.colorClass - Clase de color para el header (ej: "blue", "indigo", "violet")
 * @param {Array} props.items - Lista de items a mostrar
 * @param {boolean} props.loading - Si está cargando datos
 * @param {number|null} props.selectedId - ID del item seleccionado (highlight visual)
 * @param {function} props.onSelect - Callback al hacer click en una fila (para drill-down)
 * @param {function} props.onEdit - Callback para editar un item
 * @param {function} props.onDelete - Callback para eliminar un item
 * @param {function} props.onCreate - Callback para crear un nuevo item
 * @param {string} props.searchPlaceholder - Placeholder del buscador
 * @param {string} props.emptyMessage - Mensaje cuando no hay items
 * @param {boolean} props.showCodigoPostal - Si se debe mostrar la columna de código postal
 * @param {string|null} props.parentLabel - Etiqueta del padre (ej: "Argentina") para contexto
 * @param {boolean} props.disabled - Si el panel está deshabilitado (no hay padre seleccionado)
 */
export default function UbicacionPanel({
  title,
  icon: Icon,
  colorClass = 'blue',
  items = [],
  loading = false,
  selectedId = null,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay registros',
  showCodigoPostal = false,
  parentLabel = null,
  disabled = false,
  onPanelClick,
}) {
  const [search, setSearch] = useState('');

  // Colores según nivel
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',   selected: 'bg-blue-50/80 dark:bg-blue-900/30',   headerBg: 'from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20',   text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', selected: 'bg-indigo-50/80 dark:bg-indigo-900/30', headerBg: 'from-indigo-50 to-white dark:from-indigo-900/10 dark:to-gray-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20',   text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800', selected: 'bg-violet-50/80 dark:bg-violet-900/30', headerBg: 'from-violet-50 to-white dark:from-violet-900/10 dark:to-gray-800' },
  };
  const c = colors[colorClass] || colors.blue;

  // Filtrado local
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.nombre.toLowerCase().includes(term) ||
        (item.codigoPostal && item.codigoPostal.includes(term))
    );
  }, [items, search]);

  // Estado deshabilitado: panel gris con mensaje
  if (disabled) {
    return (
      <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">
              {title} {parentLabel && <span className="font-normal">de {parentLabel}</span>}
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center">
            Seleccione un registro del panel anterior para ver {title.toLowerCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden"
      onClick={onPanelClick}
    >
      {/* Header del panel */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r ${c.headerBg}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
              {title}
              {parentLabel && <span className="font-normal text-gray-500 dark:text-gray-400"> de {parentLabel}</span>}
              <span className="ml-1.5 text-xs font-normal text-gray-400">({items.length})</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50">
        <SearchInput
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          disabled={loading}
        />
      </div>

      {/* Tabla */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
            <InnerLoading message="Cargando..." />
          </div>
        )}

        <div className="h-full overflow-y-auto custom-scrollbar">
          {!loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
              <Search className="h-6 w-6 opacity-30" />
              <p className="text-xs">
                {search ? 'Sin resultados' : emptyMessage}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2.5 w-8">#</th>
                  <th className="px-3 py-2.5">Nombre</th>
                  {showCodigoPostal && <th className="px-3 py-2.5 w-24">C.P.</th>}
                  <th className="px-3 py-2.5 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((item, idx) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelect?.(item)}
                      className={`group transition-all duration-150 ${
                        onSelect ? 'cursor-pointer' : ''
                      } ${
                        isSelected
                          ? `${c.selected} ring-1 ring-inset ring-${colorClass}-200 dark:ring-${colorClass}-800`
                          : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/20'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-gray-400 dark:text-gray-500 text-xs">
                        {idx + 1}
                      </td>
                      <td className={`px-3 py-2.5 font-medium truncate ${
                        isSelected 
                          ? `${c.text} font-semibold` 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {capitalizeFirst(item.nombre)}
                      </td>
                      {showCodigoPostal && (
                        <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 font-mono text-xs truncate">
                          {item.codigoPostal || <span className="italic opacity-50">—</span>}
                        </td>
                      )}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <TableButton variant="edit" icon={Pencil} onClick={() => onEdit(item)} />
                          <TableButton variant="delete" icon={Trash2} onClick={() => onDelete(item)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
