import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, User, Key } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import SortableHeader from '@admin-ui/SortableHeader';
import ChangePasswordModal from './ChangePasswordModal';
import axiosInstance from '@api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { toast } from 'react-hot-toast';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

const AdministradoresTable = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState(null);

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
            const errorMsg = err.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
            setError(errorMsg);
            toast.error(errorMsg, { id: 'fetch-error' });
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

    const handlePasswordChange = (id) => {
        setSelectedAdminId(id);
        setPasswordModalOpen(true);
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

    const { sortedData: sortedAdmins, sortKey, sortDir, handleSort } = useSort(filteredAdmins, 'apellido');

    const totalPages = Math.ceil(sortedAdmins.length / ITEMS_PER_PAGE);
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAdmins.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, sortedAdmins]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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
        <div className="relative flex flex-col flex-grow overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Consultando privilegios..." />
            </div>
          )}

          <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <SortableHeader column="apellido" label="Nombre Completo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="numeroDocumento" label="Documento" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="email" label="Email" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="telefono" label="Teléfono" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              {sortedAdmins.length > 0 ? (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentItems.map((admin) => (
                    <tr key={admin.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center truncate">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4 truncate">
                            <div className="font-medium text-gray-900 dark:text-white transition-all max-w-[200px] truncate md:max-w-[300px]">
                              {capitalizeFirst(admin.nombre)} {capitalizeFirst(admin.apellido)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                        <span className="font-semibold uppercase mr-2">{admin.tipoDocumento}</span>
                        {admin.numeroDocumento}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {admin.email || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                        {admin.telefono || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <TableButton variant="view" icon={Key} onClick={() => handlePasswordChange(admin.id)} title="Cambiar Contraseña" />
                                                    <TableButton variant="edit" icon={Edit} onClick={() => handleEdit(admin.id)} />
                                                    <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(admin.id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <User className="mb-2 h-8 w-8 opacity-50" />
                        <p>No se encontraron administradores que coincidan con la búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>

                {/* Paginación */}
                <TablePagination
                    currentPage={currentPage}
                    totalItems={sortedAdmins.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                />

                <ChangePasswordModal 
                    isOpen={passwordModalOpen}
                    onClose={() => setPasswordModalOpen(false)}
                    empleadoId={selectedAdminId}
                />
            </div>
        </div>
    );
};

export default AdministradoresTable;
