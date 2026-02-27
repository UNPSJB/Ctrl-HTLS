import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, ShieldCheck } from 'lucide-react';
import TableButton from '@/components/ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

const ITEMS_PER_PAGE = 10;

const MOCK_ADMINS = [
    { id: 'mock-1', nombre: 'Adriel', apellido: 'Admin', rol: 'administrador', email: 'admin@control.com', numeroDocumento: '12345678', tipoDocumento: 'dni', telefono: '1122334455', direccion: 'Oficina Central' },
    { id: 'mock-2', nombre: 'Soporte', apellido: 'Técnico', rol: 'administrador', email: 'soporte@control.com', numeroDocumento: '87654321', tipoDocumento: 'dni', telefono: '5544332211', direccion: 'Soporte Remoto' }
];

const AdministradoresList = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        // Simular carga de mocks
        await new Promise(resolve => setTimeout(resolve, 300));
        setAdmins(MOCK_ADMINS);
        setLoading(false);
    };

    const handleEdit = (id) => {
        navigate(`/admin/personal/administradores/editar/${id}`);
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

    const handleCreate = () => {
        navigate('/admin/personal/administradores/nuevo');
    };

    return (
        <div className="space-y-6">

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

                {/* Barra de Acceso Rápido */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar administrador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Administrador
                    </button>
                </div>

                {/* Tabla Administradores */}
                <div className="overflow-x-auto min-h-[400px] flex flex-col">
                    {loading ? (
                        <InnerLoading message="Consultando privilegios..." />
                    ) : filteredAdmins.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Administrador</th>
                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Documento</th>
                                    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
                                    <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentItems.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors bg-white dark:bg-gray-800">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center">
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                                <div className="ml-4 text-sm">
                                                    <div className="font-medium text-gray-900 dark:text-white capitalize transition-all">
                                                        {admin.nombre.toLowerCase()} {admin.apellido.toLowerCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {admin.numeroDocumento}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(admin.id)} />
                                                <TableButton variant="delete" icon={Trash2} onClick={() => { }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
                            <p className="text-gray-500 dark:text-gray-400">No se encontraron administradores que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </div>

                {/* Paginación Estándar */}
                {!loading && filteredAdmins.length > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)}</span> de <span className="font-medium">{filteredAdmins.length}</span> resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdministradoresList;
