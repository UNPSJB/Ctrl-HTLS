import { InnerLoading } from '@/components/ui/InnerLoading';

export default function DashboardLayout({ title, description, loading, children }) {
  return (
    <div className="h-full w-full overflow-y-auto">
      {/* El padding va en el contenedor interno para que el scrollbar se ubique al extremo derecho */}
      <div className="flex flex-col gap-6 p-6 pb-8">
        
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</div>
          )}
        </div>

        {/* Contenido principal o Spinner de carga */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <InnerLoading message="Cargando resumen general..." />
          </div>
        ) : (
          children
        )}

      </div>
    </div>
  );
}
