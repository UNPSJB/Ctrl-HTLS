import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Users, User, Edit, Filter } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import SortableHeader from '@admin-ui/SortableHeader';
import axiosInstance from '@/api/axiosInstance';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { toast } from 'react-hot-toast';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useSort } from '@/hooks/useSort';
import { Modal } from '@admin-ui';

const ITEMS_PER_PAGE = 100;

const EncargadosTable = () => {
  const [encargados, setEncargados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Filtro de asignación: 'asignados' | 'libres' | 'todos'
  const [assignFilter, setAssignFilter] = useState('asignados');
  const [encargadoToDelete, setEncargadoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Cicla entre asignados → libres → todos
  const ASSIGN_CYCLE = ['asignados', 'libres', 'todos'];
  const ASSIGN_META = {
    asignados:{ label: 'Con hotel',   color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    libres:   { label: 'Sin hotel',   color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    todos:    { label: 'Todos',       color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
  };
  const cycleAssign = () => {
    setAssignFilter(prev => {
      const idx = ASSIGN_CYCLE.indexOf(prev);
      return ASSIGN_CYCLE[(idx + 1) % ASSIGN_CYCLE.length];
    });
    setCurrentPage(1);
  };

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

  const handleDeleteClick = (encargado) => {
    setEncargadoToDelete(encargado);
  };

  const confirmDelete = async () => {
    if (!encargadoToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/hotel/encargados/${encargadoToDelete.id}`);
      setEncargados(encargados.filter(e => e.id !== encargadoToDelete.id));
      toast.success('Encargado eliminado');
      setEncargadoToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar encargado');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEncargados = useMemo(() => {
    // 1. Filtrar por texto
    let result = encargados.filter(e =>
      e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.dni?.includes(searchTerm)
    );
    // 2. Filtrar por asignación
    if (assignFilter === 'asignados') result = result.filter(e =>  !!e.hotel);
    if (assignFilter === 'libres')    result = result.filter(e => !e.hotel);
    return result;
  }, [encargados, searchTerm, assignFilter]);

  const { sortedData: sortedEncargados, sortKey, sortDir, handleSort } = useSort(filteredEncargados, 'nombre');

  const totalPages = Math.ceil(sortedEncargados.length / ITEMS_PER_PAGE);
  const currentItems = sortedEncargados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda + Filtro de Asignación */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md">
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

            {/* Botón ciclo: todos → con hotel → sin hotel */}
            <button
              type="button"
              onClick={cycleAssign}
              disabled={loading}
              title={`Filtro: ${ASSIGN_META[assignFilter].label}. Click para cambiar.`}
              className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                ASSIGN_META[assignFilter].color
              } ${
                ASSIGN_META[assignFilter].bg
              } ${
                ASSIGN_META[assignFilter].border
              }`}
            >
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{ASSIGN_META[assignFilter].label}</span>
            </button>
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
                  <SortableHeader column="nombre" label="Nombre Completo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="dni" label="Documento" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="telefono" label="Teléfono" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="hotel.nombre" label="Hotel" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              {sortedEncargados.length > 0 ? (
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
                          <TableButton
                            variant="edit"
                            icon={Edit}
                            onClick={() => navigate(`/admin/encargados/editar/${encargado.id}`)}
                          />
                          <TableButton variant="delete" icon={Trash2} onClick={() => handleDeleteClick(encargado)} />
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

        <TablePagination
          currentPage={currentPage}
          totalItems={sortedEncargados.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>

      <Modal
        isOpen={!!encargadoToDelete}
        onClose={() => setEncargadoToDelete(null)}
        title={encargadoToDelete?.hotel ? "Acción no permitida" : "Eliminar Encargado"}
        onConfirm={encargadoToDelete?.hotel ? () => setEncargadoToDelete(null) : confirmDelete}
        loading={isDeleting}
        confirmLabel={encargadoToDelete?.hotel ? "Entendido" : "Sí, eliminar"}
        confirmIcon={encargadoToDelete?.hotel ? null : Trash2}
        variant={encargadoToDelete?.hotel ? "default" : "red"}
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          {encargadoToDelete?.hotel ? (
            <p>
              El encargado <strong className="text-gray-900 dark:text-white font-medium">{capitalizeFirst(encargadoToDelete.nombre)} {capitalizeFirst(encargadoToDelete.apellido)}</strong> se encuentra actualmente asignado al hotel <strong className="text-gray-900 dark:text-white font-medium">{capitalizeFirst(encargadoToDelete.hotel.nombre)}</strong>. No puede ser eliminado hasta que sea desvinculado de dicho hotel.
            </p>
          ) : (
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente al encargado <strong className="text-gray-900 dark:text-white font-medium">{encargadoToDelete ? `${capitalizeFirst(encargadoToDelete.nombre)} ${capitalizeFirst(encargadoToDelete.apellido)}` : ''}</strong>?
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EncargadosTable;
