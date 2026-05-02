import { useState, useMemo, useEffect } from 'react';
import { Eye, Building2, PowerOff, CheckCircle2, Filter } from 'lucide-react';
import { DataTable, DataTableToolbar, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import { capitalizeFirst } from '@/utils/stringUtils';
import { useHotelsData } from '@admin-hooks/useHotelsData';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/ui/form';
import { Modal } from '@admin-ui';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import EncargadosSelector from '@/modules/admin/shared/components/selectors/EncargadosSelector';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 100;

const HotelesTable = () => {
  const { hoteles, loading, error, refetch } = useHotelsData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelToToggle, setHotelToToggle] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('activos');

  const STATUS_CYCLE = ['activos', 'inactivos', 'todos'];
  const STATUS_META = {
    activos: { label: 'Activos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    inactivos: { label: 'Inactivos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    todos: { label: 'Todos', color: 'text-gray-700 dark:text-gray-200', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
  };
  const cycleStatus = () => {
    setStatusFilter(prev => {
      const idx = STATUS_CYCLE.indexOf(prev);
      return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    });
    setCurrentPage(1);
  };

  const handleToggleStatus = (hotel) => {
    setHotelToToggle(hotel);
    setSelectedEncargadoId(null);
  };

  const confirmToggle = async () => {
    if (!hotelToToggle) return;
    setIsToggling(true);

    try {
      if (hotelToToggle.eliminado) {
        await axiosInstance.patch(`/hotel/${hotelToToggle.hotelId}/reactivar`, {
          encargadoId: selectedEncargadoId
        });
        toast.success(`Activado: El hotel ${capitalizeFirst(hotelToToggle.nombre)} vuelve a estar operativo.`);
      } else {
        await axiosInstance.delete(`/hotel/${hotelToToggle.hotelId}`);
        toast.success(`Suspendido: El hotel ${capitalizeFirst(hotelToToggle.nombre)} ha sido desactivado temporalmente.`);
      }
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar estado del hotel');
    } finally {
      setIsToggling(false);
      setHotelToToggle(null);
    }
  };

  const filteredHoteles = useMemo(() => {
    if (!hoteles) return [];
    const lowerTerm = searchTerm.toLowerCase();
    let result = searchTerm
      ? hoteles.filter(h =>
        h.nombre.toLowerCase().includes(lowerTerm) ||
        h.ubicacion?.nombreCiudad?.toLowerCase().includes(lowerTerm) ||
        h.ubicacion?.nombreProvincia?.toLowerCase().includes(lowerTerm)
      )
      : hoteles;
    if (statusFilter === 'activos') result = result.filter(h => !h.eliminado);
    if (statusFilter === 'inactivos') result = result.filter(h => h.eliminado);
    return result;
  }, [hoteles, searchTerm, statusFilter]);

  const CATEGORIA_ORDEN = { a: 0, b: 1, c: 2 };
  const getCategoriaOrden = (hotel) => {
    const raw = String(hotel.categoria?.estrellas ?? '').toLowerCase().trim();
    if (!raw) return Infinity;
    if (raw in CATEGORIA_ORDEN) return CATEGORIA_ORDEN[raw];
    const num = parseFloat(raw);
    return isNaN(num) ? Infinity : num + 3;
  };

  const categoriaComparators = {
    'categoria.estrellas': (a, b) => getCategoriaOrden(a) - getCategoriaOrden(b),
  };

  const { sortedData: sortedHoteles, sortKey, sortDir, handleSort } = useSort(filteredHoteles, 'nombre', 'asc', categoriaComparators);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedHoteles.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedHoteles]);

  const handleView = (id) => {
    navigate(`/admin/hoteles/${id}/dashboard`);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre Hotel',
      render: (hotel) => (
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
      )
    },
    {
      key: 'encargadoNombre',
      label: 'Encargado',
      render: (hotel) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate block">
          {hotel.encargadoNombre ? capitalizeFirst(hotel.encargadoNombre) : <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'ubicacion.nombreCiudad',
      label: 'Ubicación',
      render: (hotel) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate block">
          {hotel.ubicacion?.nombreCiudad ? (
            <span className="truncate block">{hotel.ubicacion.nombreCiudad}, {hotel.ubicacion.nombreProvincia || <span className="italic text-gray-400">—</span>}</span>
          ) : (
            <span className="italic text-gray-400">—</span>
          )}
        </span>
      )
    },
    {
      key: 'categoria.estrellas',
      label: 'Categoría',
      render: (hotel) => (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
          {hotel.categoria?.estrellas || <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (hotel) => (
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
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <DataTableToolbar>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={cycleStatus}
              disabled={loading}
              title={`Filtro actual: ${STATUS_META[statusFilter].label}. Click para cambiar.`}
              className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 ${STATUS_META[statusFilter].color
                } ${STATUS_META[statusFilter].bg
                } ${STATUS_META[statusFilter].border
                }`}
            >
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{STATUS_META[statusFilter].label}</span>
            </button>
          </div>
        </DataTableToolbar>

        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          loadingMessage="Sincronizando hoteles..."
          emptyIcon={Building2}
          emptyMessage="No se encontraron hoteles que coincidan con la búsqueda."
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          rowClassName={(hotel) => hotel.eliminado ? 'opacity-50 grayscale' : ''}
        />

        <DataTablePagination
          currentPage={currentPage}
          totalItems={sortedHoteles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      </div>

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
        confirmLabel={"Aceptar"}
        variant={hotelToToggle?.eliminado ? "indigo" : "red"}
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
                <EncargadosSelector
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
