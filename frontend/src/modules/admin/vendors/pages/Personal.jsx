import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const Personal = () => {
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

    // Definir contenido dinámico del header
    const headerContent = activeTab === 'vendedores'
        ? { title: 'Vendedores', description: 'Gestione el equipo comercial y sus accesos a hoteles.' }
        : { title: 'Administradores', description: 'Administre los usuarios con acceso total al sistema.' };

    return (
        <div className="space-y-6">
            {/* Encabezado de la Página */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {activeTab === 'vendedores' ? <UserCheck className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{headerContent.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{headerContent.description}</p>
                    </div>
                </div>
            </div>

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

            {/* Contenido dinámico (Listados) */}
            <div className="animate-in fade-in duration-300">
                <Outlet />
            </div>
        </div>
    );
};

export default Personal;
