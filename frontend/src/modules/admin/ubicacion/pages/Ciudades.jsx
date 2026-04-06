import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Building, Pencil, Trash2 } from 'lucide-react';
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

function Ciudades() {
  const { paisId, provinciaId } = useParams();
  const { ciudades, provincias, paises, loading, fetchPaises, fetchProvincias, fetchCiudades, crear, editar, eliminar } = useLocalidad();
  const { setCrumbLabel } = useBreadcrumbs();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [entidadEditando, setEntidadEditando] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchPaises();
    fetchProvincias(paisId);
    fetchCiudades(provinciaId);
  }, [paisId, provinciaId, fetchPaises, fetchProvincias, fetchCiudades]);

  // Obtener nombres de los listados para Header y Breadcrumb
  const paisActual = paises.find(p => String(p.id) === String(paisId));
  const provinciaActual = provincias.find(p => String(p.id) === String(provinciaId));

  const nombrePais = paisActual ? capitalizeFirst(paisActual.nombre) : '...';
  const nombreProvincia = provinciaActual ? capitalizeFirst(provinciaActual.nombre) : '...';

  // Registrar etiquetas en Breadcrumbs usando sus paths únicos para evitar colisiones
  useEffect(() => {
    if (nombrePais && nombrePais !== '...') {
      setCrumbLabel(`/admin/ubicacion/paises/${paisId}`, nombrePais);
    }
  }, [paisId, nombrePais, setCrumbLabel]);

  useEffect(() => {
    if (nombreProvincia && nombreProvincia !== '...') {
      setCrumbLabel(`/admin/ubicacion/paises/${paisId}/provincias/${provinciaId}`, nombreProvincia);
    }
  }, [paisId, provinciaId, nombreProvincia, setCrumbLabel]);

  const filteredCiudades = useMemo(() => {
    if (!searchTerm.trim()) return ciudades;
    return ciudades.filter(c =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.codigoPostal && c.codigoPostal.includes(searchTerm))
    );
  }, [ciudades, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCiudades.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentItems = filteredCiudades.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleOpenCreate = () => { setEntidadEditando(null); setModalOpen(true); };
  const handleOpenEdit = (item) => { setEntidadEditando(item); setModalOpen(true); };

  const handleModalSuccess = async (datos) => {
    if (entidadEditando) {
      await editar(entidadEditando.id, 'ciudad', datos);
    } else {
      await crear('ciudad', datos);
    }
    setModalOpen(false);
    setEntidadEditando(null);
    fetchCiudades(provinciaId);
  };

  const handleConfirmDelete = async () => {
    const ok = await eliminar(deleteTarget.id, 'ciudad');
    if (ok) { setDeleteTarget(null); fetchCiudades(provinciaId); }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <ListHeader
        title={`Ciudades de ${nombreProvincia}`}
        description={`Administra las ciudades de ${nombreProvincia}`}
        actionLabel="Nueva Ciudad"
        onAction={handleOpenCreate}
        icon={Building}
      />

      {/* Tabla */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

          {/* Barra de Búsqueda */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="max-w-md">
              <SearchInput
                placeholder="Buscar ciudad o código postal..."
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
                <InnerLoading message="Cargando ciudades..." />
              </div>
            )}

            {/* Encabezado fijo */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-700/30">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4 w-[8%]">#</th>
                    <th className="px-6 py-4 w-[50%]">Nombre</th>
                    <th className="px-6 py-4 w-[20%]">Código Postal</th>
                    <th className="px-6 py-4 w-[22%] text-right">Acciones</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Cuerpo desplazable */}
            <div className="flex-grow overflow-y-auto">
              {!loading && filteredCiudades.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
                  <Building className="h-8 w-8 opacity-40 mb-2" />
                  <p className="text-sm">
                    {searchTerm ? 'Sin resultados para esa búsqueda' : `No hay ciudades en ${nombreProvincia} todavía`}
                  </p>
                </div>
              ) : (
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {currentItems.map((ciudad, idx) => (
                      <tr key={ciudad.id} className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20">
                        <td className="px-6 py-3 text-gray-400 dark:text-gray-500 text-xs w-[8%]">
                          {(safePage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200 w-[50%] truncate">
                          {capitalizeFirst(ciudad.nombre)}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs w-[20%] truncate">
                          {ciudad.codigoPostal || <span className="italic opacity-50">—</span>}
                        </td>
                        <td className="px-6 py-3 w-[22%]">
                          <div className="flex items-center justify-end gap-1">
                            <TableButton variant="edit" icon={Pencil} onClick={() => handleOpenEdit(ciudad)} />
                            <TableButton variant="delete" icon={Trash2} onClick={() => setDeleteTarget(ciudad)} />
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
            totalItems={filteredCiudades.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <UbicacionModal
          tipo="ciudad"
          parentId={Number(provinciaId)}
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
        title="¿Eliminar Ciudad?"
        description={`Esta acción no se puede deshacer. Se eliminará la ciudad "${deleteTarget?.nombre}".`}
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

export default Ciudades;
