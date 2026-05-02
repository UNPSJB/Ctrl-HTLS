import { useEffect } from 'react';
import { Globe, Building, Map, Plus, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Modal from '@ui/Modal';
import { FormField, TextInput } from '@form';
import { RULES, LIMITS } from '@/utils/validationRules';

// Metadatos por tipo de entidad geográfica
const TIPO_META = {
  pais:      { label: 'País',      icon: Globe,     variant: 'blue' },
  provincia: { label: 'Provincia', icon: Map,       variant: 'indigo' },
  ciudad:    { label: 'Ciudad',    icon: Building,  variant: 'blue' },
};

/**
 * Modal para crear o editar una entidad geográfica (país, provincia o ciudad).
 * Usa react-hook-form para validación controlada y consistente con el resto del sistema.
 */
function UbicacionModal({ tipo, parentId, entidad, onSuccess, onClose, loading }) {
  const isEditing = !!entidad;
  const meta = TIPO_META[tipo] ?? TIPO_META.pais;

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    mode: 'onChange',
  });

  // Cargar o resetear datos al abrir/cambiar entidad
  useEffect(() => {
    if (entidad) {
      reset({
        nombre: entidad.nombre || '',
        codigoPostal: entidad.codigoPostal || '',
      });
    } else {
      reset({ nombre: '', codigoPostal: '' });
    }
  }, [entidad, tipo, reset]);

  const handleFormSubmit = async (data) => {
    const datos = { nombre: data.nombre.trim() };

    // Agregar parentId según el tipo
    if (tipo === 'provincia' && parentId) datos.paisId = parentId;
    if (tipo === 'ciudad' && parentId) {
      datos.provinciaId = parentId;
      datos.codigoPostal = data.codigoPostal.trim();
    }

    try {
      await onSuccess(datos);
    } catch {
      // El error ya fue mostrado por el hook con toast
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? `Editar ${meta.label}` : `Nuevo/a ${meta.label}`}
      description={isEditing ? `Modificando: ${entidad?.nombre}` : `Complete los datos para crear un/a nuevo/a ${meta.label}`}
      onConfirm={handleSubmit(handleFormSubmit)}
      confirmLabel={isEditing ? 'Guardar cambios' : 'Crear'}
      confirmIcon={isEditing ? Save : Plus}
      cancelLabel="Cancelar"
      loading={loading}
      confirmDisabled={!isValid || loading}
      variant={meta.variant}
      size="sm"
    >
      <div className="space-y-4">
        {/* Campo: Nombre */}
        <FormField label="Nombre" required error={errors.nombre}>
          <TextInput
            {...register('nombre', {
              required: `El nombre es obligatorio`,
              ...RULES.nombreUbicacion,
            })}
            maxLength={LIMITS.nombreUbicacion}
            placeholder={`Ej: ${tipo === 'pais' ? 'Argentina' : tipo === 'provincia' ? 'Buenos Aires' : 'La Plata'}`}
            autoFocus
          />
        </FormField>

        {/* Campo: Código Postal (solo para ciudades) */}
        {tipo === 'ciudad' && (
          <FormField label="Código Postal" required error={errors.codigoPostal}>
            <TextInput
              {...register('codigoPostal', {
                required: 'El código postal es obligatorio',
                ...RULES.codigoPostal,
              })}
              maxLength={LIMITS.codigoPostal}
              placeholder="Ej: 1900"
            />
          </FormField>
        )}
      </div>
    </Modal>
  );
}

export default UbicacionModal;
