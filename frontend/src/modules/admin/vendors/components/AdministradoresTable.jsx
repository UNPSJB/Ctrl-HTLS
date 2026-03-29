import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Search, Plus, X, User } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';

const ITEMS_PER_PAGE = 100;

const AdministradoresTable = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/administradores');
            setAdmins(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cargar los administradores');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
            try {
                await axiosInstance.delete(`/empleado/${id}`);
                setAdmins(prev => prev.filter((a) => a.id !== id));
            } catch (err) {
                alert('Error al eliminar administrador');
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/administradores/editar/${id}`);
    };

    const filteredAdmins = useMemo(() => {
        if (!searchTerm) return admins;
        const lowerTerm = searchTerm.toLowerCase();
        return admins.filter(a =>
            a.nombre.toLowerCase().includes(lowerTerm) ||
            a.apellido.toLowerCase().includes(lowerTerm) ||
            a.numeroDocumento.includes(lowerTerm)
        );
    }, [admins, searchTerm]);

    const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAdmins.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, filteredAdmins]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
        <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

                {/* Barra de Búsqueda Centrada */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div className="max-w-md">
                        <SearchInput
                            placeholder="Buscar por nombre o documento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClear={() => setSearchTerm('')}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Tabla Administradores */}
                <div className="relative flex flex-col flex-grow overflow-hidden min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
                            <InnerLoading message="Consultando privilegios..." />
                        </div>
                    )}

                    {/* Encabezado fijo Fuera del Scroll */}
                    <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-700/30">
                        <table className="w-full table-fixed text-left text-sm">
                            <thead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 w-[30%]">Nombre Completo</th>
                                    <th className="px-6 py-4 w-[20%]">Documento</th>
                                    <th className="px-6 py-4 w-[25%]">Email</th>
                                    <th className="px-6 py-4 w-[15%]">Teléfono</th>
                                    <th className="px-6 py-4 w-[10%] text-right">Acciones</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Cuerpo desplazable con Scroll Interno */}
                    <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                        {filteredAdmins.length > 0 ? (
                            <table className="w-full table-fixed border-collapse text-left text-sm">
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {currentItems.map((admin) => (
                                        <tr key={admin.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                            <td className="px-6 py-3 w-[30%]">
                                                <div className="flex items-center truncate">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div className="ml-4 truncate">
                                                        <div className="font-medium text-gray-900 dark:text-white transition-all truncate">
                                                            {capitalizeFirst(admin.nombre)} {capitalizeFirst(admin.apellido)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 w-[20%] truncate">
                                                <span className="font-semibold uppercase mr-2">{admin.tipoDocumento}</span>
                                                {admin.numeroDocumento}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 w-[25%] truncate">
                                                {admin.email || <span className="italic text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 w-[15%] truncate">
                                                {admin.telefono || <span className="italic text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-3 text-right w-[10%]">
                                                <div className="flex justify-end gap-2">
                                                    <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(admin.id)} />
                                                    <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(admin.id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <User className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
                                <p className="text-gray-500 dark:text-gray-400">No se encontraron administradores que coincidan con la búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Paginación */}
                <TablePagination
                    currentPage={currentPage}
                    totalItems={filteredAdmins.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default AdministradoresTable;
