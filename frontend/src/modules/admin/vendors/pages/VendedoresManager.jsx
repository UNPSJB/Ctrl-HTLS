import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';

const VendedoresManager = () => {
    const [documento, setDocumento] = useState('');
    const [buscando, setBuscando] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!documento.trim()) {
            toast.error('Ingrese un número de documento');
            return;
        }

        try {
            setBuscando(true);
            const response = await axiosInstance.get(`/vendedor/buscar/${documento}`);
            const vendedor = response.data;

            if (vendedor && vendedor.id) {
                toast.success(`Vendedor encontrado: ${vendedor.nombre} ${vendedor.apellido}`);
                navigate(`/admin/vendedores/editar/${vendedor.id}`);
            } else {
                toast.error('Vendedor no encontrado');
            }
        } catch (error) {
            console.error(error);
            const mensaje = error.response?.status === 404
                ? 'Vendedor no encontrado con ese documento'
                : 'Error al buscar vendedor';
            toast.error(mensaje);
        } finally {
            setBuscando(false);
        }
    };

    const handleCreate = () => {
        navigate('/admin/vendedores/nuevo');
    };

    return (
        <div className="space-y-6">
            {/* Fila 1: Búsqueda y Creación */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    {/* Formulario de Búsqueda */}
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por número de documento..."
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={buscando}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {buscando ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>

                    {/* Botón de Crear */}
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg border border-green-600 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                    >
                        <UserPlus className="h-4 w-4" />
                        Registrar Nuevo Vendedor
                    </button>
                </div>
            </div>

            {/* Fila 2: Contenido Dinámico (Formulario) */}
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default VendedoresManager;
