import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EncargadosTable from '../components/EncargadosTable';

const Encargados = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header de la Página */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Encargados</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Administra la base de datos de encargados disponibles o asignados</p>
                </div>
                <button
                    onClick={() => navigate('/admin/encargados/nuevo')}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 h-10 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                >
                    <UserPlus className="h-4 w-4" />
                    Nuevo Encargado
                </button>
            </div>

            {/* Componente de Tabla (Datos) */}
            <EncargadosTable />
        </div>
    );
};

export default Encargados;
