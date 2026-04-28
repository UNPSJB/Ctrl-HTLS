import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Modal } from '@admin-ui';
import { FormField, NumberInput } from '@form';

/**
 * Modal para registrar un nuevo descuento por cantidad de habitaciones.
 */
export default function DescuentoFormModal({
  isOpen,
  onClose,
  onSave
}) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      reset({ cantidad_de_habitaciones: '', porcentaje: '' });
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      await onSave(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Descuento"
      description="Premie a clientes que reservan múltiples habitaciones simultáneamente."
      onConfirm={handleSubmit(handleFormSubmit)}
      loading={submitting}
      confirmDisabled={!isValid || submitting}
      confirmLabel="Registrar Descuento"
      confirmIcon={Plus}
      variant="indigo"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Cantidad de Habitaciones" required error={errors.cantidad_de_habitaciones}>
          <NumberInput
            min="1"
            max="50"
            placeholder="Ej: 3"
            {...register('cantidad_de_habitaciones', {
              required: 'La cantidad de habitaciones es obligatoria',
              min: { value: 1, message: 'La cantidad mínima es 1 habitación' },
              max: { value: 50, message: 'La cantidad máxima es 50 habitaciones' },
            })}
          />
        </FormField>

        <FormField label="Porcentaje de Descuento (%)" required error={errors.porcentaje}>
          <NumberInput
            min="1"
            max="100"
            placeholder="Ej: 5"
            {...register('porcentaje', {
              required: 'El porcentaje es obligatorio',
              min: { value: 1, message: 'El porcentaje mínimo es 1%' },
              max: { value: 100, message: 'El porcentaje máximo es 100%' },
            })}
          />
        </FormField>
      </div>
    </Modal>
  );
}
