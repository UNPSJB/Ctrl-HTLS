import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, Pencil, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { ListHeader } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { SearchInput } from '@form';
import { capitalizeFirst } from '@/utils/stringUtils';
import useLocalidad from '../hooks/useLocalidad';
import UbicacionModal from '../components/UbicacionModal';
import axiosInstance from '@api/axiosInstance';

const ITEMS_PER_PAGE = 15;

// ─── Modal de confirmación de borrado ────────────────────────────────────────
function ConfirmDeleteModal({ entidad, tipo, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">¿Eliminar {tipo}?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">"{entidad?.nombre}"</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Esta acción no se puede deshacer. Los registros dependientes también serán eliminados.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 h-9 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
function CiudadesPage() {
  const navigate = useNavigate();
  const { provinciaId } = useParams();
  const { ciudades, loading, fetchCiudades, crear, editar, eliminar } = useLocalidad();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [entidadEditando, setEntidadEditando] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Datos de la provincia actual para header y botón volver
  const [provinciaInfo, setProvinciaInfo] = useState({ nombre: '...', paisId: null });

  useEffect(() => {
    fetchCiudades(provinciaId);
    // Obtenemos info de la provincia directamente desde la API de localidades
    axiosInstance.get(`/localidad/${provinciaId}?tipo=provincia`)
      .then(({ data }) => {
        setProvinciaInfo({
          nombre: data.nombre || '...',
          paisId: data.paisId || null,
        });
      })
      .catch(() => {
        // Si falla, mostramos texto genérico
        setProvinciaInfo({ nombre: 'Provincia', paisId: null });
      });
  }, [provinciaId, fetchCiudades]);

  const nombreProvincia = capitalizeFirst(provinciaInfo.nombre);

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

  const handleVolver = () => {
    if (provinciaInfo.paisId) {
      navigate(`/admin/ubicacion/paises/${provinciaInfo.paisId}/provincias`);
    } else {
      navigate('/admin/ubicacion/paises');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">

      {/* Botón volver + Header */}
      <div className="flex-shrink-0">
        <button
          onClick={handleVolver}
          className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Provincias
        </button>
        <ListHeader
          title={`Ciudades de ${nombreProvincia}`}
          description={`Administra las ciudades que pertenecen a ${nombreProvincia}`}
          actionLabel="Nueva Ciudad"
          onAction={handleOpenCreate}
          icon={Building}
        />
      </div>

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
      {deleteTarget && (
        <ConfirmDeleteModal
          entidad={deleteTarget}
          tipo="Ciudad"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default CiudadesPage;
