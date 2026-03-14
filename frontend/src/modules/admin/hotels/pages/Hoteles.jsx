import HotelesList from '../components/HotelesList';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hoteles = () => {
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate('/admin/hoteles/nuevo');
    };

    return (
        <div className="space-y-6">
            {/* Encabezado de la Página */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Hoteles</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Administra los hoteles, ubicaciones y categorías del sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Registrar Hotel
                </button>
            </div>

            {/* Listado de Hoteles */}
            <HotelesList />
        </div>
    );
};

export default Hoteles;
