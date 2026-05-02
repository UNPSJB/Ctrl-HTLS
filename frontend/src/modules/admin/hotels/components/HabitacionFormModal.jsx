import { useState, useEffect } from 'react';
import { Plus, Hash, Layers, Bed } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Modal } from '@admin-ui';
import { FormField, SelectInput, NumberInput } from '@form';

export default function HabitacionFormModal({
  isOpen,
  onClose,
  habitacion = null, // null = crear, object = editar
  tiposFiltrados = [],
  onSave
}) {
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  useEffect(() => {
    if (isOpen) {
      if (habitacion) {
        reset({
          numero: habitacion.numero,
          piso: habitacion.piso,
          tipoHabitacionId: habitacion.tipoHabitacionId || habitacion.idTipoHabitacion || ''
        });
      } else {
        reset({ numero: '', piso: '', tipoHabitacionId: '' });
      }
    } else {
      reset();
    }
  }, [isOpen, habitacion, reset]);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        numero: Number(data.numero),
        piso: Number(data.piso),
        idTipoHabitacion: Number(data.tipoHabitacionId),
      };
      await onSave(payload, habitacion);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitacion ? 'Editar Habitación' : 'Nueva Habitación'}
      description={habitacion ? 'Modifique los datos de la habitación física' : 'Complete los datos para registrar una nueva unidad'}
      onConfirm={handleSubmit(handleFormSubmit)}
      loading={submitting}
      confirmDisabled={!isValid || submitting}
      confirmLabel={habitacion ? 'Guardar Cambios' : 'Registrar'}
      confirmIcon={Plus}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          label="Número"
          required
          error={errors.numero}
          icon={Hash}
        >
          <NumberInput
            min="1"
            max="999"
            {...register('numero', {
              required: 'El número de habitación es obligatorio',
              min: { value: 1, message: 'El número mínimo es 1' },
              max: { value: 999, message: 'El número máximo es 999' },
            })}
            placeholder="Ej: 101"
          />
        </FormField>

        <FormField
          label="Piso"
          required
          error={errors.piso}
          icon={Layers}
        >
          <NumberInput
            min="0"
            max="999"
            {...register('piso', {
              required: 'El piso es obligatorio',
              min: { value: 0, message: 'El piso mínimo es 0 (Planta Baja = 0)' },
              max: { value: 999, message: 'El piso máximo es 999' },
            })}
            placeholder="Ej: 1"
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField
            label="Tipo de Habitación"
            required
            error={errors.tipoHabitacionId}
            icon={Bed}
          >
            <SelectInput
              {...register('tipoHabitacionId', {
                required: 'Campo obligatorio',
              })}
            >
              <option value="">Seleccione tipo...</option>
              {tiposFiltrados.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.precio !== undefined ? `- $${t.precio}` : ''}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>
      </div>
    </Modal>
  );
}
