/**
 * Componente de tarjeta para visualización de KPIs y métricas.
 * 
 * @param {object} props
 * @param {import('lucide-react').LucideIcon} props.icon - Ícono de lucide-react
 * @param {string} props.title - Título de la tarjeta
 * @param {string|number} props.value - Valor principal a mostrar
 * @param {string} [props.color='blue'] - Color del tema (purple, blue, amber, orange, indigo, emerald, cyan, green)
 * @param {string} [props.className] - Clases adicionales para el contenedor
 */
function KpiCard({ icon: Icon, title, value, color = 'blue', className = '' }) {
  const styles = {
    purple: {
      container: 'border-purple-100 dark:border-purple-900/20',
      icon: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
    },
    blue: {
      container: 'border-blue-100 dark:border-blue-900/20',
      icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    },
    amber: {
      container: 'border-amber-100 dark:border-amber-900/20',
      icon: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    },
    orange: {
      container: 'border-orange-100 dark:border-orange-900/20',
      icon: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20',
    },
    indigo: {
      container: 'border-indigo-100 dark:border-indigo-900/20',
      icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
    },
    emerald: {
      container: 'border-emerald-100 dark:border-emerald-900/20',
      icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
    },
    cyan: {
      container: 'border-cyan-100 dark:border-cyan-900/20',
      icon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20',
    },
    green: {
      container: 'border-green-100 dark:border-green-900/20',
      icon: 'bg-green-50 text-green-600 dark:bg-green-900/20',
    },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div
      className={`flex h-full flex-col justify-center rounded-xl border bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-gray-800 ${currentStyle.container} ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentStyle.icon}`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-1 text-xs font-medium text-gray-500"
            title={title}
          >
            {title}
          </p>
          <h3
            className="truncate text-lg font-bold text-gray-900 dark:text-white md:text-xl"
            title={String(value)}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default KpiCard;
