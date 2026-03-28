import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader - Componente de encabezado estandarizado para páginas del panel admin.
 * 
 * @param {string|React.ReactNode} title - Título principal de la página.
 * @param {string|React.ReactNode} description - Subtítulo o descripción de la página.
 * @param {string} backTo - Ruta opcional para el botón de retroceso.
 * @param {function} onBack - Función opcional para el botón de retroceso.
 * @param {React.ElementType} icon - Ícono de Lucide opcional para mostrar junto al título.
 * @param {React.ReactNode} extra - Contenido adicional para el lado derecho (opcional).
 * @param {boolean} loading - Si es true, muestra un estado de carga (shimmer).
 * @param {string} className - Clases adicionales para el contenedor.
 */
const PageHeader = ({
  title,
  description,
  backTo,
  onBack,
  icon: Icon,
  extra,
  loading = false,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backTo) return navigate(backTo);
    navigate(-1);
  };

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <div className="flex items-center gap-4 min-w-0">
        {/* Botón de Retroceso (Siempre presente según requerimiento) */}
        <button
          onClick={handleBack}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          type="button"
          aria-label="Volver"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Ícono Temático Opcional */}
        {Icon && !loading && (
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Icon className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
            </div>
          ) : (
            <>
              <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {title}
              </h1>
              {description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {description}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {extra && <div className="hidden md:block shrink-0">{extra}</div>}
    </div>
  );
};

export default PageHeader;
