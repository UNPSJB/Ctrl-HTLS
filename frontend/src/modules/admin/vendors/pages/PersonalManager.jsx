import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const PersonalManager = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determinar la pestaña activa basada en la ruta
    // Cambiamos la lógica para que las pestañas simplemente sean enlaces visuales o estados
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
            {/* Selector de tipo de personal (Solo y completamente solo) */}
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

            {/* Contenido dinámico (Listados) */}
            <div className="animate-in fade-in duration-300">
                <Outlet />
            </div>
        </div>
    );
};

export default PersonalManager;
