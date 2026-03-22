import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, X, Users, User, ChevronLeft, ChevronRight } from 'lucide-react';
import TableButton from '@/components/ui/TableButton';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Barra de Búsqueda Interna */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex flex-col min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
            <InnerLoading message="Cargando encargados..." />
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredEncargados.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Encargado</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Estado / Asignación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((encargado) => (
                  <tr key={encargado.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    {/* Nombre y Avatar */}
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {encargado.nombre?.toLowerCase()} {encargado.apellido?.toLowerCase()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-bold border rounded px-1 text-[10px] mr-2 uppercase dark:border-gray-600">
                        {encargado.tipoDocumento}
                      </span>
                      {encargado.dni}
                    </td>

                    {/* Teléfono */}
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {encargado.telefono ? encargado.telefono : <span className="italic text-gray-400">—</span>}
                    </td>

                    {/* Estado de Asignación */}
                    <td className="px-6 py-3">
                      {encargado.hotel ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {encargado.hotel.nombre}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Sin Asignar
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Se omite Edit porque Backend no tiene PUT /hotel/encargados/:id */}
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
      {!loading && filteredEncargados.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEncargados.length)}</span> de <span className="font-medium">{filteredEncargados.length}</span> resultados
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
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncargadosTable;
