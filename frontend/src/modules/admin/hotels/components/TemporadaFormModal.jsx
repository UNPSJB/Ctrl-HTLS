import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toISODate } from '@/utils/dateUtils';
import { Modal } from '@admin-ui';
import { FormField, SelectInput, TextInput, NumberInput } from '@form';

/**
 * Modal para registrar una nueva temporada (alta/baja) en el hotel.
 */
export default function TemporadaFormModal({
  isOpen,
  onClose,
  onSave
}) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  // Fecha mínima = hoy en formato YYYY-MM-DD (zona local Argentina)
  const hoy = toISODate(new Date());
  const fechaInicio = watch('fechaInicio');

  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      reset({ tipo: '', porcentaje: '', fechaInicio: '', fechaFin: '' });
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
      title="Configurar Temporada"
      description="Defina un periodo de tiempo y su ajuste porcentual sobre la tarifa base."
      onConfirm={handleSubmit(handleFormSubmit)}
      loading={submitting}
      confirmDisabled={!isValid || submitting}
      confirmLabel="Registrar Temporada"
      confirmIcon={Plus}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* Fila 1: Tipo de temporada + Porcentaje */}
        <FormField label="Tipo de Temporada" required error={errors.tipo}>
          <SelectInput {...register('tipo', { required: 'Seleccione un tipo' })}>
            <option value="">Seleccione...</option>
            <option value="alta">Temporada Alta</option>
            <option value="baja">Temporada Baja</option>
          </SelectInput>
        </FormField>

        <FormField label="Porcentaje de Ajuste (%)" required error={errors.porcentaje}>
          <NumberInput
            min="1"
            max="100"
            placeholder="Ej: 15"
            {...register('porcentaje', {
              required: 'El porcentaje es obligatorio',
              valueAsNumber: true,
              min: { value: 1, message: 'El porcentaje mínimo es 1%' },
              max: { value: 100, message: 'El porcentaje máximo es 100%' },
            })}
          />
        </FormField>

        {/* Fila 2: Fecha inicio + Fecha fin */}
        <FormField label="Fecha de Inicio" required error={errors.fechaInicio}>
          <TextInput
            type="date"
            min={hoy}
            {...register('fechaInicio', {
              required: 'La fecha de inicio es obligatoria',
              validate: (val) => val >= hoy || 'No se permiten fechas pasadas',
            })}
          />
        </FormField>

        <FormField label="Fecha de Fin" required error={errors.fechaFin}>
          <TextInput
            type="date"
            min={fechaInicio || hoy}
            {...register('fechaFin', {
              required: 'La fecha de fin es obligatoria',
              validate: (val) => {
                if (val < hoy) return 'No se permiten fechas pasadas';
                if (fechaInicio && val <= fechaInicio) return 'Debe ser posterior a la fecha de inicio';
                return true;
              },
            })}
          />
        </FormField>
      </div>
    </Modal>
  );
}
