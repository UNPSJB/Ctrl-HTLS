import { useState, useEffect } from 'react';
import { Globe, Building, Map } from 'lucide-react';
import ActionModal from '@admin-ui/ActionModal';
import { FormField, TextInput } from '@form';

const TIPO_META = {
  pais:      { label: 'País',      icon: Globe,     variant: 'blue' },
  provincia: { label: 'Provincia', icon: Map,       variant: 'indigo' },
  ciudad:    { label: 'Ciudad',    icon: Building,  variant: 'blue' },
};

function UbicacionModal({ tipo, parentId, entidad, onSuccess, onClose, loading }) {
  const isEditing = !!entidad;
  const meta = TIPO_META[tipo] ?? TIPO_META.pais;

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

  const handleConfirm = async () => {
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

  return (
    <ActionModal
      isOpen
      onClose={onClose}
      title={isEditing ? `Editar ${meta.label}` : `Nuevo/a ${meta.label}`}
      description={isEditing ? `Modificando: ${entidad?.nombre}` : `Completa los datos para crear un/a nuevo/a ${meta.label}`}
      onConfirm={handleConfirm}
      confirmLabel={isEditing ? 'Guardar cambios' : 'Crear'}
      cancelLabel="Cancelar"
      loading={loading}
      variant={meta.variant}
      size="sm"
    >
      {/* Nombre */}
      <div className="space-y-4">
        <FormField label="Nombre" required error={errors.nombre}>
          <TextInput
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrors((p) => ({ ...p, nombre: undefined }));
            }}
            placeholder={`Ej: ${tipo === 'pais' ? 'Argentina' : tipo === 'provincia' ? 'Buenos Aires' : 'La Plata'}`}
            autoFocus
          />
        </FormField>

        {/* Código Postal solo para ciudades */}
        {tipo === 'ciudad' && (
          <FormField label="Código Postal" required error={errors.codigoPostal}>
            <TextInput
              value={codigoPostal}
              onChange={(e) => {
                setCodigoPostal(e.target.value);
                setErrors((p) => ({ ...p, codigoPostal: undefined }));
              }}
              placeholder="Ej: 1900"
            />
          </FormField>
        )}
      </div>
    </ActionModal>
  );
}

export default UbicacionModal;
