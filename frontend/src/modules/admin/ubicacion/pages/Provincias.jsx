import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Map, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { ListHeader, Modal } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import useLocalidad from '../hooks/useLocalidad';
import UbicacionModal from '../components/UbicacionModal';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';

const ITEMS_PER_PAGE = 15;

function Provincias() {
  const navigate = useNavigate();
  const { paisId } = useParams();
  const { provincias, paises, loading, fetchProvincias, fetchPaises, crear, editar, eliminar } = useLocalidad();
  const { setCrumbLabel } = useBreadcrumbs();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [entidadEditando, setEntidadEditando] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchPaises();
    fetchProvincias(paisId);
  }, [paisId, fetchPaises, fetchProvincias]);

  // Nombre del país para mostrar en el header y registrar en breadcrumb
  const paisActual = paises.find(p => String(p.id) === String(paisId));
  const nombrePais = paisActual ? capitalizeFirst(paisActual.nombre) : '...';

  // Registrar el nombre del país en el breadcrumb usando su path absoluto para evitar colisiones
  useEffect(() => {
    if (nombrePais && nombrePais !== '...') {
      setCrumbLabel(`/admin/ubicacion/paises/${paisId}`, nombrePais);
    }
  }, [paisId, nombrePais, setCrumbLabel]);

  const filteredProvincias = useMemo(() => {
    if (!searchTerm.trim()) return provincias;
    return provincias.filter(p =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [provincias, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProvincias.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentItems = filteredProvincias.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleOpenCreate = () => { setEntidadEditando(null); setModalOpen(true); };
  const handleOpenEdit = (item) => { setEntidadEditando(item); setModalOpen(true); };

  const handleModalSuccess = async (datos) => {
    if (entidadEditando) {
      await editar(entidadEditando.id, 'provincia', datos);
    } else {
      await crear('provincia', datos);
    }
    setModalOpen(false);
    setEntidadEditando(null);
    fetchProvincias(paisId);
  };

  const handleConfirmDelete = async () => {
    const ok = await eliminar(deleteTarget.id, 'provincia');
    if (ok) { setDeleteTarget(null); fetchProvincias(paisId); }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <ListHeader
        title={`Provincias de ${nombrePais}`}
        description={`Administra las provincias de ${nombrePais}`}
        actionLabel="Nueva Provincia"
        onAction={handleOpenCreate}
        icon={Map}
      />

      {/* Tabla */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

          {/* Barra de Búsqueda */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="max-w-md">
              <SearchInput
                placeholder="Buscar provincia..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                onClear={() => setSearchTerm('')}
                disabled={loading}
              />
            </div>
          </div>

          {/* Área de tabla */}
          <div className="relative flex flex-col flex-grow overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
                <InnerLoading message="Cargando provincias..." />
              </div>
            )}

            {/* Encabezado fijo */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-700/30">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4 w-[8%]">#</th>
                    <th className="px-6 py-4 w-[60%]">Nombre</th>
                    <th className="px-6 py-4 w-[32%] text-right">Acciones</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Cuerpo desplazable */}
            <div className="flex-grow overflow-y-auto">
              {!loading && filteredProvincias.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
                  <Map className="h-8 w-8 opacity-40 mb-2" />
                  <p className="text-sm">
                    {searchTerm ? 'Sin resultados para esa búsqueda' : `No hay provincias en ${nombrePais} todavía`}
                  </p>
                </div>
              ) : (
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {currentItems.map((provincia, idx) => (
                      <tr key={provincia.id} className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20">
                        <td className="px-6 py-3 text-gray-400 dark:text-gray-500 text-xs w-[8%]">
                          {(safePage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200 w-[60%] truncate">
                          {capitalizeFirst(provincia.nombre)}
                        </td>
                        <td className="px-6 py-3 w-[32%]">
                          {/* Ver primero, luego editar y eliminar */}
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/ubicacion/paises/${paisId}/provincias/${provincia.id}/ciudades`)}
                              className="mr-1 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                              title="Ver ciudades de esta provincia"
                            >
                              <span>Ciudades</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <TableButton variant="edit" icon={Pencil} onClick={() => handleOpenEdit(provincia)} />
                            <TableButton variant="delete" icon={Trash2} onClick={() => setDeleteTarget(provincia)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Paginación */}
          <TablePagination
            currentPage={safePage}
            totalItems={filteredProvincias.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <UbicacionModal
          tipo="provincia"
          parentId={Number(paisId)}
          entidad={entidadEditando}
          onSuccess={handleModalSuccess}
          onClose={() => { setModalOpen(false); setEntidadEditando(null); }}
          loading={loading}
        />
      )}

      {/* Modal confirmación borrado */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar Provincia?"
        description={`Esta acción no se puede deshacer. Se eliminarán también todas las ciudades de "${deleteTarget?.nombre}".`}
        onConfirm={handleConfirmDelete}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="red"
        loading={loading}
        size="sm"
      />
    </div>
  );
}

export default Provincias;
