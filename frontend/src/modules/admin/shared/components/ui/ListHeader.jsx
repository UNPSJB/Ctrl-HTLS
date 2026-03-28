import { Plus } from 'lucide-react';

/**
 * ListHeader - Componente genérico para cabeceras de páginas de listado (Estilo Plano).
 */
const ListHeader = ({
    title,
    description,
    onAction,
    actionLabel,
    actionIcon: ActionIcon = Plus
}) => {
    return (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center py-2">
            <div className="min-w-0">
                <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                )}
            </div>

            {actionLabel && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 h-11 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 shrink-0"
                >
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default ListHeader;
