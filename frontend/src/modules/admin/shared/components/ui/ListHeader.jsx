import { Plus } from 'lucide-react';
import AppButton from '@/components/ui/AppButton';

/**
 * ListHeader - Componente genérico para cabeceras de páginas de listado (Estilo Plano).
 */
const ListHeader = ({
    title,
    description,
    onAction,
    actionLabel,
    actionIcon: ActionIcon = Plus,
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
                <div className="flex items-center gap-3 shrink-0">
                    <AppButton
                        onClick={onAction}
                        icon={ActionIcon}
                    >
                        {actionLabel}
                    </AppButton>
                </div>
            )}
        </div>
    );
};

export default ListHeader;
