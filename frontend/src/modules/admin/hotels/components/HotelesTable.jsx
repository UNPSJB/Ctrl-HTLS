import { useState, useMemo, useEffect } from 'react';
import { Eye, Building2, PowerOff, CheckCircle2, Filter } from 'lucide-react';
import TableButton from '@admin-ui/TableButton';
import SortableHeader from '@admin-ui/SortableHeader';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useHotelsData } from '@admin-hooks/useHotelsData';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/ui/form';
import { Modal } from '@admin-ui';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import EncargadosList from '@/modules/admin/shared/components/selectors/EncargadosList';
import { useSort } from '@/hooks/useSort';

// Lista principal de hoteles para administración
const HotelesTable = () => {
  const { hoteles, loading, error, refetch } = useHotelsData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelToToggle, setHotelToToggle] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null);
  // Filtro de estado: 'todos' | 'activos' | 'inactivos'
  const [statusFilter, setStatusFilter] = useState('todos');
  const ITEMS_PER_PAGE = 100;

  // Cicla entre todos → activos → inactivos → todos
  const STATUS_CYCLE = ['todos', 'activos', 'inactivos'];
  const STATUS_META = {
    todos:    { label: 'Todos',    color: 'text-gray-500 dark:text-gray-400',   bg: 'bg-white dark:bg-gray-700',          border: 'border-gray-200 dark:border-gray-600' },
    activos:  { label: 'Activos', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700' },
    inactivos:{ label: 'Inactivos', color: 'text-red-500 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-300 dark:border-red-700' },
  };
  const cycleStatus = () => {
    setStatusFilter(prev => {
      const idx = STATUS_CYCLE.indexOf(prev);
      return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    });
    setCurrentPage(1);
  };

  const handleToggleStatus = (hotel) => {
    setHotelToToggle(hotel); // Invocamos el modal sea para activar o desactivar
    setSelectedEncargadoId(null); // Reset del selector al abrir
  };

  const confirmToggle = async () => {
    if (!hotelToToggle) return;
    setIsToggling(true);

    try {
      if (hotelToToggle.eliminado) {
        // Enviar reactivacion
        await axiosInstance.patch(`/hotel/${hotelToToggle.hotelId}/reactivar`, {
          encargadoId: selectedEncargadoId
        });
        toast.success(`Activado: El hotel ${capitalizeFirst(hotelToToggle.nombre)} vuelve a estar operativo.`);
      } else {
        // Enviar baja
        await axiosInstance.delete(`/hotel/${hotelToToggle.hotelId}`);
        toast.success(`Suspendido: El hotel ${capitalizeFirst(hotelToToggle.nombre)} ha sido desactivado temporalmente.`);
      }
      refetch(); // Refrescamos tabla real
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar estado del hotel');
    } finally {
      setIsToggling(false);
      setHotelToToggle(null);
    }
  };

  const filteredHoteles = useMemo(() => {
    if (!hoteles) return [];
    // 1. Filtrar por texto de búsqueda
    const lowerTerm = searchTerm.toLowerCase();
    let result = searchTerm
      ? hoteles.filter(h =>
          h.nombre.toLowerCase().includes(lowerTerm) ||
          h.ubicacion?.nombreCiudad?.toLowerCase().includes(lowerTerm) ||
          h.ubicacion?.nombreProvincia?.toLowerCase().includes(lowerTerm)
        )
      : hoteles;
    // 2. Filtrar por estado
    if (statusFilter === 'activos')   result = result.filter(h => !h.eliminado);
    if (statusFilter === 'inactivos') result = result.filter(h =>  h.eliminado);
    return result;
  }, [hoteles, searchTerm, statusFilter]);

  /**
   * Orden de categorías: a=0, b=1, c=2, luego numérico (1=3, 1.5=4, 2=5 ... 5=12).
   * Los valores sin categoría (null/undefined) van al final con Infinity.
   */
  const CATEGORIA_ORDEN = { a: 0, b: 1, c: 2 };
  const getCategoriaOrden = (hotel) => {
    const raw = String(hotel.categoria?.estrellas ?? '').toLowerCase().trim();
    if (!raw) return Infinity;
    if (raw in CATEGORIA_ORDEN) return CATEGORIA_ORDEN[raw];
    const num = parseFloat(raw);
    return isNaN(num) ? Infinity : num + 3; // offset: numéricos van después de a/b/c
  };

  const categoriaComparators = {
    'categoria.estrellas': (a, b) => getCategoriaOrden(a) - getCategoriaOrden(b),
  };

  const { sortedData: sortedHoteles, sortKey, sortDir, handleSort } = useSort(filteredHoteles, 'nombre', 'asc', categoriaComparators);

  const totalPages = Math.ceil(sortedHoteles.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedHoteles.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedHoteles]);



  const handleView = (id) => {
    navigate(`/admin/hoteles/${id}/dashboard`);
  };

  // Resetear página al buscar o cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Barra de Búsqueda + Filtro de Estado */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {/* Buscador */}
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
                disabled={loading}
              />
            </div>

            {/* Botón de filtro de estado: cicla todos → activos → inactivos */}
            <button
              type="button"
              onClick={cycleStatus}
              disabled={loading}
              title={`Filtro actual: ${STATUS_META[statusFilter].label}. Click para cambiar.`}
              className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                STATUS_META[statusFilter].color
              } ${
                STATUS_META[statusFilter].bg
              } ${
                STATUS_META[statusFilter].border
              }`}
            >
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{STATUS_META[statusFilter].label}</span>
            </button>
          </div>
        </div>

        <div className="relative flex flex-col flex-grow overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Sincronizando hoteles..." />
            </div>
          )}

          <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400">
                <tr>
                  <SortableHeader column="nombre" label="Nombre Hotel" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="encargadoNombre" label="Encargado" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="ubicacion.nombreCiudad" label="Ubicación" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader column="categoria.estrellas" label="Categoría" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              {filteredHoteles.length > 0 ? (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentItems.map((hotel) => (
                    <tr
                      key={hotel.hotelId}
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30 ${hotel.eliminado ? 'opacity-50 grayscale' : ''}`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${hotel.eliminado ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="ml-4 truncate">
                            <div className={`font-medium transition-all max-w-[200px] truncate md:max-w-[300px] ${hotel.eliminado ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {hotel.eliminado ? <del>{capitalizeFirst(hotel.nombre)}</del> : capitalizeFirst(hotel.nombre)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                        {hotel.encargadoNombre ? capitalizeFirst(hotel.encargadoNombre) : <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {hotel.ubicacion?.nombreCiudad ? (
                          <span className="truncate block">{hotel.ubicacion.nombreCiudad}, {hotel.ubicacion.nombreProvincia || <span className="italic text-gray-400">—</span>}</span>
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {hotel.categoria?.estrellas || <span className="italic text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <TableButton
                            variant="view"
                            icon={Eye}
                            onClick={() => handleView(hotel.hotelId)}
                            aria-label="Ver detalles"
                            title="Gestionar Hotel"
                            disabled={hotel.eliminado}
                          />
                          <TableButton
                            variant={!hotel.eliminado ? "delete" : "view"}
                            icon={!hotel.eliminado ? PowerOff : CheckCircle2}
                            onClick={() => handleToggleStatus(hotel)}
                            aria-label={!hotel.eliminado ? "Dar de baja" : "Activar"}
                            title={!hotel.eliminado ? "Dar de baja temporalmente" : "Activar Hotel"}
                          />
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
                        <Building2 className="mb-2 h-8 w-8 opacity-50" />
                        <p>No se encontraron hoteles que coincidan con la búsqueda.</p>
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
          totalItems={sortedHoteles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>

      {/* Modal Interactivo de Alternancia */}
      <Modal
        isOpen={!!hotelToToggle}
        onClose={() => {
          setHotelToToggle(null);
          setSelectedEncargadoId(null);
        }}
        title={hotelToToggle?.eliminado ? "¿Reactivar Hotel?" : "¿Confirmar la baja del Hotel?"}
        onConfirm={confirmToggle}
        loading={isToggling}
        confirmDisabled={hotelToToggle?.eliminado && !selectedEncargadoId}
        confirmLabel={hotelToToggle?.eliminado ? "Asignar y Reactivar" : "Confirmar y Dar de Baja"}
        confirmIcon={hotelToToggle?.eliminado ? CheckCircle2 : PowerOff}
        size={hotelToToggle?.eliminado ? "lg" : "md"}
      >
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            {hotelToToggle?.eliminado ? 'Estás a punto de volver a poner operativo el hotel ' : 'Estás a punto de dar de baja el hotel '}
            <strong className="text-gray-900 dark:text-white font-medium">
              {hotelToToggle?.nombre ? capitalizeFirst(hotelToToggle.nombre) : ''}
            </strong>.
            {hotelToToggle?.eliminado
              ? ' Para reanudar sus operaciones comerciales, debes asignarle un encargado obligatoriamente.'
              : ' Esta acción deshabilitará sus operaciones comerciales temporalmente. Podrás reactivarlo luego.'}
          </p>

          {hotelToToggle?.eliminado ? (
            <div className="pt-2">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Selecciona un Encargado Disponible</h4>
              <div className="h-[350px]">
                <EncargadosList
                  value={selectedEncargadoId}

                  onChange={setSelectedEncargadoId}
                />
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <p className="font-medium text-gray-900 dark:text-white mb-2">
                Consecuencias:
              </p>
              <ul className="space-y-1 list-disc pl-5 text-gray-500 dark:text-gray-400">
                <li>El personal asignado quedará desvinculado de la sucursal.</li>
                <li>Habitaciones y paquetes no estarán disponibles para alquilar.</li>
                <li>Tarifas y descuentos quedarán inactivos.</li>
              </ul>
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 italic">
              Nota: Los alquileres ya activos no se verán afectados por el cambio de estado.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HotelesTable;
