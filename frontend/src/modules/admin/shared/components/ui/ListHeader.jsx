import { Plus } from 'lucide-react';

/**
 * ListHeader - Componente genérico para cabeceras de páginas de listado (Estilo Plano).
 */
const ListHeader = ({
    title,
    description,
    onAction,
    actionLabel,
    actionIcon: ActionIcon = Plus,
    secondaryAction,
    secondaryLabel,
    secondaryIcon: SecondaryIcon,
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

            {(actionLabel || secondaryLabel) && (
                <div className="flex items-center gap-3 shrink-0">
                    {/* Botón secundario (outline) */}
                    {secondaryLabel && (
                        <button
                            onClick={secondaryAction}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 h-11 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 shrink-0"
                        >
                            {SecondaryIcon && <SecondaryIcon className="h-4 w-4" />}
                            {secondaryLabel}
                        </button>
                    )}

                    {/* Botón primario (azul) */}
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
            )}
        </div>
    );
};

export default ListHeader;
