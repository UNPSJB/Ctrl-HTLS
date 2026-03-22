import { useState, useEffect, useCallback } from 'react';
import { Globe, Map, Building, Plus, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import useLocalidad from '../hooks/useLocalidad';
import UbicacionTable from '../components/UbicacionTable';
import UbicacionModal from '../components/UbicacionModal';

// ─── constantes de niveles ────────────────────────────────────────────────────
const NIVELES = {
  paises:    { tipo: 'pais',      label: 'Países',     icon: Globe,     hijo: 'provincias' },
  provincias:{ tipo: 'provincia', label: 'Provincias', icon: Map,       hijo: 'ciudades' },
  ciudades:  { tipo: 'ciudad',    label: 'Ciudades',   icon: Building,  hijo: null },
};

// Clases estáticas por nivel (Tailwind necesita strings completos, no interpolados)
const NIVEL_STYLES = {
  paises:    { btn: 'bg-blue-600 hover:bg-blue-700',   icon: 'bg-blue-50 dark:bg-blue-900/20',   iconText: 'text-blue-600 dark:text-blue-400' },
  provincias:{ btn: 'bg-indigo-600 hover:bg-indigo-700', icon: 'bg-indigo-50 dark:bg-indigo-900/20', iconText: 'text-indigo-600 dark:text-indigo-400' },
  ciudades:  { btn: 'bg-violet-600 hover:bg-violet-700', icon: 'bg-violet-50 dark:bg-violet-900/20', iconText: 'text-violet-600 dark:text-violet-400' },
};

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

// ─── Componente principal ─────────────────────────────────────────────────────
function Ubicacion() {
  const {
    paises, provincias, ciudades, loading,
    fetchPaises, fetchProvincias, fetchCiudades,
    crear, editar, eliminar,
  } = useLocalidad();

  // Nivel de navegación activo
  const [nivel, setNivel] = useState('paises');
  // Pais/Provincia seleccionados para el drill-down
  const [paisActual, setPaisActual] = useState(null);
  const [provinciaActual, setProvinciaActual] = useState(null);

  // Modal de crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [entidadEditando, setEntidadEditando] = useState(null);
  // Modal de confirmación de borrado
  const [deleteTarget, setDeleteTarget] = useState(null);

  const nivelCfg = NIVELES[nivel];
  const items = nivel === 'paises' ? paises : nivel === 'provincias' ? provincias : ciudades;

  // ─── Carga de datos según nivel ─────────────────────────────────────────────
  const cargarNivel = useCallback(() => {
    if (nivel === 'paises') fetchPaises();
    else if (nivel === 'provincias' && paisActual) fetchProvincias(paisActual.id);
    else if (nivel === 'ciudades' && provinciaActual) fetchCiudades(provinciaActual.id);
  }, [nivel, paisActual, provinciaActual, fetchPaises, fetchProvincias, fetchCiudades]);

  useEffect(() => {
    cargarNivel();
  }, [cargarNivel]);


  // ─── Navegación drill-down ───────────────────────────────────────────────────
  const handleDrillDown = (item) => {
    if (nivel === 'paises') {
      setPaisActual(item);
      setNivel('provincias');
    } else if (nivel === 'provincias') {
      setProvinciaActual(item);
      setNivel('ciudades');
    }
  };

  const handleBack = () => {
    if (nivel === 'ciudades') {
      setProvinciaActual(null);
      setNivel('provincias');
    } else if (nivel === 'provincias') {
      setPaisActual(null);
      setNivel('paises');
    }
  };

  // ─── Crear / Editar ──────────────────────────────────────────────────────────
  const handleOpenCreate = () => { setEntidadEditando(null); setModalOpen(true); };
  const handleOpenEdit = (item) => { setEntidadEditando(item); setModalOpen(true); };

  const handleModalSuccess = async (datos) => {
    if (entidadEditando) {
      await editar(entidadEditando.id, nivelCfg.tipo, datos);
    } else {
      await crear(nivelCfg.tipo, datos);
    }
    setModalOpen(false);
    setEntidadEditando(null);
    cargarNivel();
  };

  // ─── Eliminar ────────────────────────────────────────────────────────────────
  const handleDelete = (item) => setDeleteTarget(item);
  const handleConfirmDelete = async () => {
    const ok = await eliminar(deleteTarget.id, nivelCfg.tipo);
    if (ok) { setDeleteTarget(null); cargarNivel(); }
  };

  // ─── Contexto del padre para el modal ────────────────────────────────────────
  const parentId = nivel === 'provincias' ? paisActual?.id : nivel === 'ciudades' ? provinciaActual?.id : null;

  const Icon = nivelCfg.icon;

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ubicación</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Gestión de países, provincias y ciudades del sistema
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className={`flex items-center gap-2 rounded-lg px-4 h-10 text-sm font-semibold text-white shadow-sm transition-colors ${NIVEL_STYLES[nivel].btn}`}
        >
          <Plus className="h-4 w-4" />
          Nuevo/a {nivelCfg.tipo === 'pais' ? 'País' : nivelCfg.tipo === 'provincia' ? 'Provincia' : 'Ciudad'}
        </button>
      </div>

      {/* Área de contenido principal */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 space-y-5">

        {/* Breadcrumb de navegación */}
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => { setPaisActual(null); setProvinciaActual(null); setNivel('paises'); }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${nivel === 'paises' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          >
            <Globe className="h-3.5 w-3.5" />
            Países
          </button>

          {(nivel === 'provincias' || nivel === 'ciudades') && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
              <button
                onClick={() => { setProvinciaActual(null); setNivel('provincias'); }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-colors ${nivel === 'provincias' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
              >
                <Map className="h-3.5 w-3.5" />
                {paisActual?.nombre}
              </button>
            </>
          )}

          {nivel === 'ciudades' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
              <span className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                <Building className="h-3.5 w-3.5" />
                {provinciaActual?.nombre}
              </span>
            </>
          )}
        </div>

        {/* Título del nivel + contador */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${NIVEL_STYLES[nivel].icon}`}>
              <Icon className={`h-4 w-4 ${NIVEL_STYLES[nivel].iconText}`} />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              {nivelCfg.label}
              <span className="ml-2 text-xs font-normal text-gray-400">({items.length})</span>
            </h2>
          </div>

          {/* Botón Volver */}
          {nivel !== 'paises' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 h-8 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              ← Volver
            </button>
          )}
        </div>

        {/* Tabla */}
        <UbicacionTable
          tipo={nivelCfg.tipo}
          items={items}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onDrillDown={nivelCfg.hijo ? handleDrillDown : null}
          drillDownLabel={nivelCfg.hijo === 'provincias' ? 'Ver provincias' : nivelCfg.hijo === 'ciudades' ? 'Ver ciudades' : null}
        />
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <UbicacionModal
          tipo={nivelCfg.tipo}
          parentId={parentId}
          entidad={entidadEditando}
          onSuccess={handleModalSuccess}
          onClose={() => { setModalOpen(false); setEntidadEditando(null); }}
          loading={loading}
        />
      )}

      {/* Modal confirmación de borrado */}
      {deleteTarget && (
        <ConfirmDeleteModal
          entidad={deleteTarget}
          tipo={nivelCfg.label.replace(/s$/, '')}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default Ubicacion;
