import { useState, useEffect, useMemo } from 'react';
import { User, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { capitalizeFirst } from '@/utils/stringUtils';
import TablePagination from '@admin-ui/TablePagination';
import SortableHeader from '@admin-ui/SortableHeader';
import { InnerLoading } from '@/components/ui/InnerLoading';
import TableButton from '@admin-ui/TableButton';
import { SearchInput } from '@form';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

/**
 * Lista de encargados disponibles (sin hotel asignado) en formato de tabla.
 * Props:
 *   value    - id del encargado actualmente seleccionado
 *   onChange - callback(id) llamado cuando cambia la selección
 *   exclude  - id de encargado a incluir aunque ya tenga hotel (para edición)
 */
export default function EncargadosList({ value, onChange, exclude = null }) {
  const [encargados, setEncargados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEncargados();
  }, []);

  const fetchEncargados = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get('/hotel/encargados');
      // Mostrar solo los sin hotel asignado, más el excluido (encargado actual en edición)
      const disponibles = data.filter(
        (e) => e.hotel === null || (exclude && e.id === exclude)
      );
      setEncargados(disponibles);
    } catch {
      setError('No se pudieron cargar los encargados disponibles.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return encargados;
    const term = searchTerm.toLowerCase();
    return encargados.filter(
      (e) =>
        e.nombre?.toLowerCase().includes(term) ||
        e.apellido?.toLowerCase().includes(term) ||
        e.dni?.toLowerCase().includes(term)
    );
  }, [encargados, searchTerm]);

  const { sortedData: sortedFiltered, sortKey, sortDir, handleSort } = useSort(filtered, 'nombre');

  const currentItems = useMemo(() => {
    return sortedFiltered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedFiltered, currentPage]);

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 max-w-sm">
            <SearchInput
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <button
            type="button"
            onClick={fetchEncargados}
            disabled={loading}
            title="Actualizar lista de encargados"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600 active:scale-95 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-blue-400"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenido: loading superpuesto o tabla */}
      <div className="relative flex flex-col flex-grow overflow-hidden min-h-0">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-gray-800/60">
            <InnerLoading message="Cargando encargados disponibles..." />
          </div>
        )}

        <div className="flex-grow overflow-auto custom-scrollbar">
          {!loading && encargados.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Sin encargados disponibles</p>
              <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-gray-400">
                Todos los encargados registrados ya están asignados a un hotel. Registrá uno nuevo.
              </p>
            </div>
          ) : !loading && sortedFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <User className="mb-2 h-8 w-8 text-gray-400 opacity-50" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron encargados.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <SortableHeader column="nombre" label="Nombre Completo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="dni" label="Documento" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="email" label="Contacto" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-6 py-4 text-right">Seleccionar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentItems.map((e) => {
                  const isSelected = value === e.id;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => onChange(isSelected ? null : e.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                      }`}
                    >
                      {/* Nombre */}
                      {/* Nombre Completo */}
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium transition-all ${
                              isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {capitalizeFirst(e.nombre)} {capitalizeFirst(e.apellido)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Documento */}
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold uppercase mr-2">
                          {e.tipoDocumento}
                        </span>
                        {e.dni}
                      </td>

                      {/* Contacto */}
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {e.telefono || <span className="italic text-gray-400">—</span>}
                      </td>

                      {/* Acción */}
                      <td className="px-6 py-3 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Seleccionado
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400">
                            Seleccionar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación */}
      <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 flex-shrink-0">
        <TablePagination
          currentPage={currentPage}
          totalItems={sortedFiltered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>
    </div>
  );
}
