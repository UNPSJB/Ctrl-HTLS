import { X, MapPin, Globe, Building, Map } from 'lucide-react';
import { FormField, TextInput } from '@form';


const TIPO_STYLES = {
  pais:      { iconBg: 'bg-blue-50 dark:bg-blue-900/20',   iconText: 'text-blue-600 dark:text-blue-400',   submitBtn: 'bg-blue-600 hover:bg-blue-700' },
  provincia: { iconBg: 'bg-indigo-50 dark:bg-indigo-900/20', iconText: 'text-indigo-600 dark:text-indigo-400', submitBtn: 'bg-indigo-600 hover:bg-indigo-700' },
  ciudad:    { iconBg: 'bg-violet-50 dark:bg-violet-900/20', iconText: 'text-violet-600 dark:text-violet-400', submitBtn: 'bg-violet-600 hover:bg-violet-700' },
};

const TIPO_META = {
  pais:      { label: 'País',      icon: Globe },
  provincia: { label: 'Provincia', icon: Map },
  ciudad:    { label: 'Ciudad',    icon: Building },
};

function UbicacionModal({ tipo, parentId, entidad, onSuccess, onClose, loading }) {
  const isEditing = !!entidad;
  const meta = TIPO_META[tipo];
  const Icon = meta?.icon || MapPin;

  const [nombre, setNombre] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [errors, setErrors] = useState({});

  // Cargar datos si es edición
  useEffect(() => {
    if (entidad) {
      setNombre(entidad.nombre || '');
      setCodigoPostal(entidad.codigoPostal || '');
    } else {
      setNombre('');
      setCodigoPostal('');
    }
    setErrors({});
  }, [entidad, tipo]);

  const validate = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (tipo === 'ciudad' && !codigoPostal.trim()) {
      newErrors.codigoPostal = 'El código postal es requerido';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const datos = { nombre: nombre.trim() };
    if (tipo === 'provincia' && parentId) datos.paisId = parentId;
    if (tipo === 'ciudad' && parentId) {
      datos.provinciaId = parentId;
      datos.codigoPostal = codigoPostal.trim();
    }

    try {
      await onSuccess(datos);
    } catch {
      // El error ya fue mostrado por el hook con toast
    }
  };

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${TIPO_STYLES[tipo]?.iconBg}`}>
              <Icon className={`h-4 w-4 ${TIPO_STYLES[tipo]?.iconText}`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {isEditing ? `Editar ${meta?.label}` : `Nuevo/a ${meta?.label}`}
              </h3>
              {isEditing && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{entidad?.nombre}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nombre */}
          <FormField label="Nombre" required error={errors.nombre}>
            <TextInput
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: undefined })); }}
              placeholder={`Ej: ${tipo === 'pais' ? 'Argentina' : tipo === 'provincia' ? 'Buenos Aires' : 'La Plata'}`}
              autoFocus
            />
          </FormField>

          {/* Código Postal (solo ciudades) */}
          {tipo === 'ciudad' && (
            <FormField label="Código Postal" required error={errors.codigoPostal}>
              <TextInput
                value={codigoPostal}
                onChange={(e) => { setCodigoPostal(e.target.value); setErrors((p) => ({ ...p, codigoPostal: undefined })); }}
                placeholder="Ej: 1900"
              />
            </FormField>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 h-9 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rounded-lg px-5 h-9 text-sm font-medium text-white transition-colors disabled:opacity-60 ${TIPO_STYLES[tipo]?.submitBtn}`}
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UbicacionModal;
