/**
 * Contenedor estándar para la barra de herramientas superior de las tablas.
 * Suele contener la barra de búsqueda y botones de filtro.
 */
export default function DataTableToolbar({ children, className = '' }) {
  return (
    <div className={`flex-shrink-0 border-b border-gray-200 px-6 py-4 dark:border-gray-700 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {children}
      </div>
    </div>
  );
}
