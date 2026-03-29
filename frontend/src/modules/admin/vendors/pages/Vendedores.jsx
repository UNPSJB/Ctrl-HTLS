import { useNavigate, Link } from 'react-router-dom';
import { ListHeader } from '@admin-ui';
import { UserCheck, DollarSign } from 'lucide-react';
import VendedoresTable from '../components/VendedoresTable';

/**
 * Vendedores - Página raíz para la gestión de vendedores.
 */
const Vendedores = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center py-2">
                {/* Título y descripción */}
                <div className="min-w-0">
                    <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        Gestión de Vendedores
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Administra la red de vendedores, sus comisiones y liquidaciones
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Botón secundario: Liquidaciones Globales */}
                    <Link
                        to="/admin/vendedores/liquidaciones"
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 h-11 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all shadow-sm"
                    >
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Liquidaciones
                    </Link>

                    {/* Botón principal: Nuevo Vendedor */}
                    <button
                        onClick={() => navigate('/admin/vendedores/nuevo')}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 h-11 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <UserCheck className="h-4 w-4" />
                        Nuevo Vendedor
                    </button>
                </div>
            </div>

            {/* Componente de Tabla */}
            <VendedoresTable />
        </div>
    );
};

export default Vendedores;
