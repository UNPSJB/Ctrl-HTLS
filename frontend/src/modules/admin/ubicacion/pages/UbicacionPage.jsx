import { useState, useEffect, useCallback } from 'react';
import { Globe, Map, Building } from 'lucide-react';
import { ListHeader, Modal } from '@admin-ui';
import { capitalizeFirst } from '@/utils/stringUtils';
import useLocalidad from '../hooks/useLocalidad';
import UbicacionPanel from '../components/UbicacionPanel';
import UbicacionModal from '../components/UbicacionModal';

/**
 * Página unificada de gestión de ubicaciones geográficas.
 * Muestra 3 paneles interconectados: Países, Provincias y Ciudades.
 * Al seleccionar un país se cargan sus provincias, al seleccionar una provincia se cargan sus ciudades.
 */
export default function UbicacionPage() {
  const {
    paises, provincias, ciudades, 
    loadingPaises, loadingProvincias, loadingCiudades, loadingAction,
    fetchPaises, fetchProvincias, fetchCiudades,
    crear, editar, eliminar,
  } = useLocalidad();

  // Panel activo para el botón de crear contextual
  const [activePanel, setActivePanel] = useState('pais');

  // Estado de selección jerárquica
  const [selectedPais, setSelectedPais] = useState(null);
  const [selectedProvincia, setSelectedProvincia] = useState(null);

  // Modal CRUD (crear/editar)
  const [modalConfig, setModalConfig] = useState(null); // { tipo, parentId, entidad }
  // Modal de confirmación de borrado
  const [deleteTarget, setDeleteTarget] = useState(null); // { item, tipo, label }

  // ─── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPaises();
  }, [fetchPaises]);

  useEffect(() => {
    if (selectedPais) {
      fetchProvincias(selectedPais.id);
    }
  }, [selectedPais, fetchProvincias]);

  useEffect(() => {
    if (selectedProvincia) {
      fetchCiudades(selectedProvincia.id);
    }
  }, [selectedProvincia, fetchCiudades]);

  // ─── Selección con limpieza de hijos ────────────────────────────────────────
  const handleSelectPais = useCallback((pais) => {
    // Si se selecciona el mismo, deseleccionar
    if (selectedPais?.id === pais.id) {
      setSelectedPais(null);
      setSelectedProvincia(null);
      return;
    }
    setSelectedPais(pais);
    setSelectedProvincia(null); // Limpiar provincia y ciudades
    setActivePanel('provincia'); // Al seleccionar un país, el foco pasa a provincias
  }, [selectedPais]);

  const handleSelectProvincia = useCallback((provincia) => {
    if (selectedProvincia?.id === provincia.id) {
      setSelectedProvincia(null);
      return;
    }
    setSelectedProvincia(provincia);
    setActivePanel('ciudad'); // Al seleccionar provincia, el foco pasa a ciudades
  }, [selectedProvincia]);

  // ─── CRUD: Abrir modales ───────────────────────────────────────────────────
  const openCreatePais = () => setModalConfig({ tipo: 'pais', parentId: null, entidad: null });
  const openCreateProvincia = () => setModalConfig({ tipo: 'provincia', parentId: selectedPais?.id, entidad: null });
  const openCreateCiudad = () => setModalConfig({ tipo: 'ciudad', parentId: selectedProvincia?.id, entidad: null });

  const openEditPais = (item) => setModalConfig({ tipo: 'pais', parentId: null, entidad: item });
  const openEditProvincia = (item) => setModalConfig({ tipo: 'provincia', parentId: selectedPais?.id, entidad: item });
  const openEditCiudad = (item) => setModalConfig({ tipo: 'ciudad', parentId: selectedProvincia?.id, entidad: item });

  // ─── CRUD: Handlers ────────────────────────────────────────────────────────
  const handleModalSuccess = async (datos) => {
    const { tipo, entidad } = modalConfig;
    if (entidad) {
      await editar(entidad.id, tipo, datos);
    } else {
      await crear(tipo, datos);
    }
    setModalConfig(null);

    // Refrescar datos del nivel correspondiente
    if (tipo === 'pais') fetchPaises();
    else if (tipo === 'provincia' && selectedPais) fetchProvincias(selectedPais.id);
    else if (tipo === 'ciudad' && selectedProvincia) fetchCiudades(selectedProvincia.id);
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const openDeletePais = (item) => setDeleteTarget({ item, tipo: 'pais', label: 'País' });
  const openDeleteProvincia = (item) => setDeleteTarget({ item, tipo: 'provincia', label: 'Provincia' });
  const openDeleteCiudad = (item) => setDeleteTarget({ item, tipo: 'ciudad', label: 'Ciudad' });

  const handleConfirmDelete = async () => {
    const { item, tipo } = deleteTarget;
    const ok = await eliminar(item.id, tipo);
    if (ok) {
      setDeleteTarget(null);

      // Refrescar y limpiar selección si se eliminó el seleccionado
      if (tipo === 'pais') {
        fetchPaises();
        if (selectedPais?.id === item.id) {
          setSelectedPais(null);
          setSelectedProvincia(null);
        }
      } else if (tipo === 'provincia') {
        if (selectedPais) fetchProvincias(selectedPais.id);
        if (selectedProvincia?.id === item.id) {
          setSelectedProvincia(null);
        }
      } else if (tipo === 'ciudad') {
        if (selectedProvincia) fetchCiudades(selectedProvincia.id);
      }
    }
  };

  // ─── Texto dinámico para el modal de borrado ───────────────────────────────
  const getDeleteDescription = () => {
    if (!deleteTarget) return '';
    const { item, tipo } = deleteTarget;
    const name = capitalizeFirst(item.nombre);
    if (tipo === 'pais') return `Esta acción no se puede deshacer. Se eliminarán también todas las provincias y ciudades de "${name}".`;
    if (tipo === 'provincia') return `Esta acción no se puede deshacer. Se eliminarán también todas las ciudades de "${name}".`;
    return `Esta acción no se puede deshacer. Se eliminará la ciudad "${name}".`;
  };

  // ─── Botón Crear Dinámico (ListHeader) ─────────────────────────────────────
  const getHeaderAction = () => {
    if (activePanel === 'ciudad') {
      return { label: 'Nueva Ciudad', action: openCreateCiudad, disabled: !selectedProvincia };
    }
    if (activePanel === 'provincia') {
      return { label: 'Nueva Provincia', action: openCreateProvincia, disabled: !selectedPais };
    }
    return { label: 'Nuevo País', action: openCreatePais, disabled: false };
  };

  const headerAction = getHeaderAction();

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Header principal */}
      <ListHeader
        title="Gestión de Ubicaciones"
        description="Administra los países, provincias y ciudades del sistema"
        icon={Globe}
        actionLabel={headerAction.label}
        onAction={headerAction.action}
        actionDisabled={headerAction.disabled}
      />

      {/* Paneles de contenido */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Fila superior: Países (50%) + Provincias (50%) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Panel de Países */}
          <UbicacionPanel
            title="Países"
            icon={Globe}
            colorClass="blue"
            items={paises}
            loading={loadingPaises}
            selectedId={selectedPais?.id}
            onSelect={handleSelectPais}
            onEdit={openEditPais}
            onDelete={openDeletePais}
            onPanelClick={() => setActivePanel('pais')}
            searchPlaceholder="Buscar país..."
            emptyMessage="No hay países registrados"
          />

          {/* Panel de Provincias */}
          <UbicacionPanel
            title="Provincias"
            icon={Map}
            colorClass="indigo"
            items={selectedPais ? provincias : []}
            loading={loadingProvincias}
            selectedId={selectedProvincia?.id}
            onSelect={handleSelectProvincia}
            onEdit={openEditProvincia}
            onDelete={openDeleteProvincia}
            onPanelClick={() => { if (selectedPais) setActivePanel('provincia'); }}
            searchPlaceholder="Buscar provincia..."
            emptyMessage="No hay provincias registradas"
            parentLabel={selectedPais ? capitalizeFirst(selectedPais.nombre) : null}
            disabled={!selectedPais}
          />
        </div>

        {/* Fila inferior: Ciudades (100%) */}
        <div className="flex-1 min-h-0">
          <UbicacionPanel
            title="Ciudades"
            icon={Building}
            colorClass="violet"
            items={selectedProvincia ? ciudades : []}
            loading={loadingCiudades}
            onEdit={openEditCiudad}
            onDelete={openDeleteCiudad}
            onPanelClick={() => { if (selectedProvincia) setActivePanel('ciudad'); }}
            searchPlaceholder="Buscar ciudad o código postal..."
            emptyMessage="No hay ciudades registradas"
            showCodigoPostal
            parentLabel={selectedProvincia ? `${capitalizeFirst(selectedPais?.nombre || '')} → ${capitalizeFirst(selectedProvincia.nombre)}` : null}
            disabled={!selectedProvincia}
          />
        </div>
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

      {/* Modal confirmación de borrado */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`¿Eliminar ${deleteTarget?.label}?`}
        description={getDeleteDescription()}
        onConfirm={handleConfirmDelete}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="red"
        loading={loadingAction}
        size="sm"
      />
    </div>
  );
}
