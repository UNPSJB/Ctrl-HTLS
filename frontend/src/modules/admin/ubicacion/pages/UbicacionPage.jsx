import { useState, useEffect, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { ListHeader, Modal } from '@admin-ui';
import { capitalizeFirst } from '@/utils/stringUtils';
import useLocalidad from '../hooks/useLocalidad';
import UbicacionesTable from '../components/UbicacionesTable';
import UbicacionModal from '../components/UbicacionModal';
import axiosInstance from '@/api/axiosInstance';

/**
 * Página unificada de gestión de ubicaciones geográficas.
 * Utiliza una tabla jerárquica: Países -> Provincias -> Ciudades.
 */
export default function UbicacionPage() {
  const {
    paises, provincias, ciudades, 
    loadingPaises, loadingProvincias, loadingCiudades, loadingAction,
    fetchPaises, fetchProvincias, fetchCiudades,
    crear, editar, eliminar,
  } = useLocalidad();

  // Estado de expansión
  const [expandedPais, setExpandedPais] = useState(null);
  const [expandedProvincia, setExpandedProvincia] = useState(null);

  // Modales
  const [modalConfig, setModalConfig] = useState(null); // { tipo, parentId, entidad }
  const [deleteTarget, setDeleteTarget] = useState(null); // { item, tipo, label, restricted, childrenType }
  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);

  // ─── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPaises();
  }, [fetchPaises]);

  const handleExpandPais = useCallback((pais) => {
    if (expandedPais?.id === pais.id) {
      setExpandedPais(null);
      setExpandedProvincia(null);
    } else {
      setExpandedPais(pais);
      setExpandedProvincia(null);
      fetchProvincias(pais.id);
    }
  }, [expandedPais, fetchProvincias]);

  const handleExpandProvincia = useCallback((provincia) => {
    if (expandedProvincia?.id === provincia.id) {
      setExpandedProvincia(null);
    } else {
      setExpandedProvincia(provincia);
      fetchCiudades(provincia.id);
    }
  }, [expandedProvincia, fetchCiudades]);

  // ─── CRUD: Abrir modales ───────────────────────────────────────────────────
  const openCreate = () => {
    if (expandedProvincia) {
      setModalConfig({ tipo: 'ciudad', parentId: expandedProvincia.id, entidad: null });
    } else if (expandedPais) {
      setModalConfig({ tipo: 'provincia', parentId: expandedPais.id, entidad: null });
    } else {
      setModalConfig({ tipo: 'pais', parentId: null, entidad: null });
    }
  };

  const openEdit = (item, tipo) => {
    let parentId = null;
    if (tipo === 'provincia') parentId = expandedPais?.id;
    if (tipo === 'ciudad') parentId = expandedProvincia?.id;
    setModalConfig({ tipo, parentId, entidad: item });
  };

  const handleModalSuccess = async (datos) => {
    const { tipo, entidad } = modalConfig;
    if (entidad) {
      await editar(entidad.id, tipo, datos);
    } else {
      await crear(tipo, datos);
    }
    setModalConfig(null);

    // Refrescar
    if (tipo === 'pais') fetchPaises();
    else if (tipo === 'provincia' && expandedPais) fetchProvincias(expandedPais.id);
    else if (tipo === 'ciudad' && expandedProvincia) fetchCiudades(expandedProvincia.id);
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const requestDelete = async (item, tipo) => {
    setIsVerifyingDelete(true);
    let hasChildren = false;
    let childrenType = '';
    let verificationError = false;
    
    try {
      if (tipo === 'pais') {
        const { data } = await axiosInstance.get(`/provincias/${item.id}`);
        if (data && data.length > 0) {
          hasChildren = true;
          childrenType = 'provincias';
        }
      } else if (tipo === 'provincia') {
        const { data } = await axiosInstance.get(`/ciudades/${item.id}`);
        if (data && data.length > 0) {
          hasChildren = true;
          childrenType = 'ciudades';
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // 404 = no hay hijos registrados, se puede eliminar con seguridad
      } else {
        // Error inesperado (red, 500, timeout): abortar y notificar al usuario
        toast.error(
          err.response?.data?.error || 'Error al verificar dependencias. Intente nuevamente.',
          { id: 'verify-delete-err' }
        );
        verificationError = true;
      }
    } finally {
      setIsVerifyingDelete(false);
    }

    // Si hubo un error de verificaci�n, no avanzar al modal
    if (verificationError) return;

    if (hasChildren) {
      setDeleteTarget({ item, tipo, restricted: true, childrenType });
    } else {
      setDeleteTarget({ item, tipo, restricted: false, label: tipo === 'pais' ? 'País' : tipo === 'provincia' ? 'Provincia' : 'Ciudad' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { item, tipo } = deleteTarget;
    const ok = await eliminar(item.id, tipo);
    if (ok) {
      setDeleteTarget(null);

      // Refrescar
      if (tipo === 'pais') {
        fetchPaises();
        if (expandedPais?.id === item.id) {
          setExpandedPais(null);
          setExpandedProvincia(null);
        }
      } else if (tipo === 'provincia') {
        if (expandedPais) fetchProvincias(expandedPais.id);
        if (expandedProvincia?.id === item.id) {
          setExpandedProvincia(null);
        }
      } else if (tipo === 'ciudad') {
        if (expandedProvincia) fetchCiudades(expandedProvincia.id);
      }
    }
  };

  const renderDeleteDescription = () => {
    if (!deleteTarget) return null;
    const { item, tipo, restricted, childrenType } = deleteTarget;
    const name = capitalizeFirst(item.nombre);
    
    if (restricted) {
      return (
        <p>
          La entidad <strong className="text-gray-900 dark:text-white font-medium">{name}</strong> no puede ser eliminada porque tiene {childrenType} asociadas. Debe eliminar primero todas sus {childrenType} para poder proceder.
        </p>
      );
    }
    return (
      <p>
        Esta acción no se puede deshacer. Se eliminará {tipo === 'ciudad' ? 'la' : 'el'} {tipo} <strong className="text-gray-900 dark:text-white font-medium">{name}</strong>.
      </p>
    );
  };

  // ─── Botón Crear Dinámico (ListHeader) ─────────────────────────────────────
  const headerActionLabel = expandedProvincia ? 'Registrar Ciudad' : expandedPais ? 'Registrar Provincia' : 'Registrar País';

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden relative">
      {/* Capa de bloqueo durante validación */}
      {isVerifyingDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-sm font-medium">Verificando dependencias...</span>
          </div>
        </div>
      )}

      {/* Header principal */}
      <ListHeader
        title="Gestión de Ubicaciones"
        description="Administra los países, provincias y ciudades del sistema"
        icon={Globe}
        actionLabel={headerActionLabel}
        onAction={openCreate}
      />

      {/* Tabla */}
      <div className="flex-1 min-h-0">
        <UbicacionesTable
          paises={paises}
          provincias={provincias}
          ciudades={ciudades}
          loadingPaises={loadingPaises}
          loadingProvincias={loadingProvincias}
          loadingCiudades={loadingCiudades}
          expandedPais={expandedPais}
          expandedProvincia={expandedProvincia}
          onExpandPais={handleExpandPais}
          onExpandProvincia={handleExpandProvincia}
          onEdit={openEdit}
          onDelete={requestDelete}
        />
      </div>

      {/* Modal crear/editar */}
      {modalConfig && (
        <UbicacionModal
          tipo={modalConfig.tipo}
          parentId={modalConfig.parentId}
          entidad={modalConfig.entidad}
          onSuccess={handleModalSuccess}
          onClose={() => setModalConfig(null)}
          loading={loadingAction}
        />
      )}

      {/* Modal confirmación / rechazo de borrado */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.restricted ? 'Acción no permitida' : `¿Eliminar ${deleteTarget?.label}?`}
        onConfirm={deleteTarget?.restricted ? () => setDeleteTarget(null) : handleConfirmDelete}
        confirmLabel={deleteTarget?.restricted ? 'Entendido' : 'Eliminar'}
        cancelLabel={deleteTarget?.restricted ? null : 'Cancelar'}
        variant={deleteTarget?.restricted ? 'default' : 'red'}
        loading={loadingAction}
        size="sm"
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          {renderDeleteDescription()}
        </div>
        {!deleteTarget?.restricted && deleteTarget?.tipo !== 'ciudad' && (
           <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-sm border border-red-100 dark:border-red-900/50">
             <strong>Advertencia:</strong> Esta acción eliminará permanentemente este {deleteTarget?.tipo}.
           </div>
        )}
      </Modal>
    </div>
  );
}
