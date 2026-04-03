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
      toast.error('Error al cargar encargados');
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

          {/* Encabezado fijo Fuera del Scroll */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-700/30">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 w-[25%]">Nombre Completo</th>
                  <th className="px-6 py-4 w-[15%]">Documento</th>
                  <th className="px-6 py-4 w-[20%]">Email</th>
                  <th className="px-6 py-4 w-[15%]">Teléfono</th>
                  <th className="px-6 py-4 w-[15%]">Hotel</th>
                  <th className="px-6 py-4 w-[10%] text-right">Acciones</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Cuerpo desplazable con Scroll Interno */}
          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {filteredEncargados.length > 0 ? (
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentItems.map((encargado) => (
                    <tr key={encargado.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      {/* Nombre y Avatar */}
                      <td className="px-6 py-3 w-[25%]">
                        <div className="flex items-center truncate">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4 truncate">
                            <div className="text-sm font-medium text-gray-900 dark:text-white transition-all truncate">
                              {capitalizeFirst(encargado.nombre)} {capitalizeFirst(encargado.apellido)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Documento */}
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 w-[15%] truncate">
                        <span className="font-semibold uppercase mr-2">
                          {encargado.tipoDocumento}
                        </span>
                        {encargado.dni}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 w-[20%] truncate">
                        {encargado.email || <span className="italic text-gray-400">—</span>}
                      </td>

                      {/* Teléfono */}
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 w-[15%] truncate">
                        {encargado.telefono || <span className="italic text-gray-400">—</span>}
                      </td>

                      {/* Estado de Asignación */}
                      <td className="px-6 py-3 w-[15%] truncate">
                        {encargado.hotel ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-full">
                            {capitalizeFirst(encargado.hotel.nombre)}
                          </span>
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-3 text-right w-[10%]">
                        <div className="flex justify-end gap-2">
                          <TableButton variant="delete" icon={Trash2} onClick={() => handleDelete(encargado.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron encargados que coincidan con la búsqueda.</p>
              </div>
            )}
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
