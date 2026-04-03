import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Users, User } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@/api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';

const ITEMS_PER_PAGE = 100;

const EncargadosTable = () => {
  const [encargados, setEncargados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEncargados();
  }, []);

  const fetchEncargados = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hotel/encargados'); // Ruta confirmada del backend
      setEncargados(response.data);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Error de red: No se pudo conectar con el servidor';
      toast.error(errorMsg, { id: 'fetch-error-enc' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este encargado?')) {
      try {
        await axiosInstance.delete(`/hotel/encargados/${id}`);
        setEncargados(encargados.filter(e => e.id !== id));
        toast.success('Encargado eliminado');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al eliminar encargado');
      }
    }
  };

  const filteredEncargados = useMemo(() => {
    // 1. Filtrar por término de búsqueda
    const filtered = encargados.filter(e =>
      e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.dni?.includes(searchTerm)
    );

    // 2. Ordenar: los que NO tienen hotel asignado van primero
    return filtered.sort((a, b) => {
      const aAsignado = !!a.hotel;
      const bAsignado = !!b.hotel;

      // Si uno está asignado y el otro no
      if (!aAsignado && bAsignado) return -1; // a va primero
      if (aAsignado && !bAsignado) return 1;  // b va primero

      // Si ambos están en la misma situación, podríamos ordenar por nombre
      return (a.nombre || '').localeCompare(b.nombre || '');
    });
  }, [encargados, searchTerm]);

  const totalPages = Math.ceil(filteredEncargados.length / ITEMS_PER_PAGE);
  const currentItems = filteredEncargados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda Interna */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="max-w-md">
            <SearchInput
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => setSearchTerm('')}
              disabled={loading}
            />
          </div>
        </div>

        <div className="relative flex flex-col flex-grow overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Cargando encargados..." />
            </div>
          )}

          <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Hotel</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              {filteredEncargados.length > 0 ? (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentItems.map((encargado) => (
                    <tr key={encargado.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      {/* Nombre y Avatar */}
                      <td className="px-6 py-3">
                        <div className="flex items-center truncate">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4 truncate">
                            <div className="text-sm font-medium text-gray-900 dark:text-white transition-all max-w-[200px] truncate md:max-w-[300px]">
                              {capitalizeFirst(encargado.nombre)} {capitalizeFirst(encargado.apellido)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Documento */}
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                        <span className="font-semibold uppercase mr-2">
                          {encargado.tipoDocumento}
                        </span>
                        {encargado.dni}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {encargado.email || <span className="italic text-gray-400">—</span>}
                      </td>

                      {/* Teléfono */}
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                        {encargado.telefono || <span className="italic text-gray-400">—</span>}
                      </td>

                      {/* Estado de Asignación */}
                      <td className="px-6 py-3 truncate max-w-[200px] md:max-w-[250px]">
                        {encargado.hotel ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-full">
                            {capitalizeFirst(encargado.hotel.nombre)}
                          </span>
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(encargado.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="mb-2 h-8 w-8 opacity-50" />
                        <p>No se encontraron encargados que coincidan con la búsqueda.</p>
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
          totalItems={filteredEncargados.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default EncargadosTable;
