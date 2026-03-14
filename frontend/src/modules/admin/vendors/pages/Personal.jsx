import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { UserCheck, Plus, DollarSign, Users } from 'lucide-react';

const Personal = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determinar la pestaña activa basada en la ruta
    const activeTab = location.pathname.includes('/administradores') ? 'administradores' : 'vendedores';

    const handleTabChange = (tab) => {
        if (tab === 'vendedores') {
            navigate('/admin/personal/vendedores');
        } else {
            navigate('/admin/personal/administradores');
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado de la Página Consolidado */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal del Sistema</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Administra los roles, vendedores y administradores</p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Selector de tipo de personal */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg w-fit border border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => handleTabChange('vendedores')}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'vendedores'
                                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <UserCheck className="w-4 h-4" />
                            Vendedores
                        </button>
                        <button
                            onClick={() => handleTabChange('administradores')}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'administradores'
                                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Administradores
                        </button>
                    </div>

                    <div className="hidden h-8 w-px bg-gray-300 dark:bg-gray-700 sm:block"></div>

                    {/* Botones de acción dinámicos reubicados */}
                    <div className="flex gap-2">
                        {activeTab === 'vendedores' ? (
                            <>
                                <Link
                                    to="/admin/personal/liquidaciones"
                                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                                >
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    Liquidaciones
                                </Link>
                                <button
                                    onClick={() => navigate('/admin/personal/vendedores/nuevo')}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Vendedor
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/admin/personal/administradores/nuevo')}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo Administrador
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido dinámico (Listados) */}
            <div className="animate-in fade-in duration-300">
                <Outlet />
            </div>
        </div>
    );
};

export default Personal;
