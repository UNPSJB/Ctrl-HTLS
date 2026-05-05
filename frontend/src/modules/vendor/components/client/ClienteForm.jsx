import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { useState } from 'react';
import { 
  FormField, 
  TextInput, 
  EmailInput, 
  TelInput, 
  SelectInput 
} from '@/components/ui/form';
import AppButton from '@/components/ui/AppButton';
import { RULES, LIMITS } from '@/utils/validationRules';
import { TIPOS_DOCUMENTO } from '@/utils/constants';
import { toast } from 'react-hot-toast';

// Formulario para la creación de un nuevo cliente (vista vendedor)
function ClienteForm({ initialDocumento = '', cliente = null, onCancel, onSuccess }) {
  const isEditing = !!cliente;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      numeroDocumento: cliente?.numeroDocumento || cliente?.documento || initialDocumento,
      tipoDocumento: cliente?.tipoDocumento || 'dni',
      nombre: cliente?.nombreOriginal || cliente?.nombre || '',
      apellido: cliente?.apellido || '',
      email: cliente?.email || '',
      telefono: cliente?.telefono || '',
    },
    mode: 'onChange',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const tipoDocumento = watch('tipoDocumento');

  // Formateadores automáticos para controlar el ingreso de datos
  const handleDocumentoChange = (e) => {
    const { value } = e.target;
    let procesado = value;
    if (['dni', 'li', 'le'].includes(tipoDocumento)) {
      procesado = value.replace(/\D/g, '');
    } else {
      procesado = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    setValue('numeroDocumento', procesado, { shouldValidate: true });
  };

  const handleNumericChange = (e) => {
    const { value } = e.target;
    setValue(e.target.name, value.replace(/\D/g, ''), { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      let response;
      if (isEditing) {
        response = await axiosInstance.put(`/cliente/${cliente.id}`, data);
        toast.success('Cliente actualizado correctamente');
      } else {
        response = await axiosInstance.post('/cliente', data);
        toast.success('Cliente registrado correctamente');
      }
      onSuccess(response.data);
    } catch (err) {
      setApiError(
        err.response?.data?.error || `Ocurrió un error al ${isEditing ? 'editar' : 'crear'} el cliente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Nombre" required error={errors.nombre}>
          <TextInput
            {...register('nombre', { 
              required: 'El nombre es obligatorio',
              ...RULES.nombre,
            })}
            maxLength={LIMITS.nombre}
            placeholder="Ej: Juan"
          />
        </FormField>

        <FormField label="Apellido" required error={errors.apellido}>
          <TextInput
            {...register('apellido', { 
              required: 'El apellido es obligatorio',
              ...RULES.apellido,
            })}
            maxLength={LIMITS.apellido}
            placeholder="Ej: Pérez"
          />
        </FormField>

        <FormField label="Tipo de Documento" required error={errors.tipoDocumento}>
          <SelectInput {...register('tipoDocumento', { required: 'Seleccione un tipo' })}>
            {TIPOS_DOCUMENTO.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Número de Documento" required error={errors.numeroDocumento}>
          <TextInput
            {...register('numeroDocumento', { 
              required: 'El documento es obligatorio',
              ...RULES.documento,
              onChange: handleDocumentoChange,
            })}
            maxLength={LIMITS.documento.max}
            readOnly
            disabled
          />
        </FormField>

        <FormField label="Email" required error={errors.email}>
          <EmailInput
            {...register('email', { 
              required: 'El email es obligatorio',
              ...RULES.email,
            })}
            maxLength={LIMITS.email}
          />
        </FormField>

        <FormField label="Teléfono" error={errors.telefono}>
          <TelInput
            {...register('telefono', {
              onChange: handleNumericChange,
              ...RULES.telefono,
            })}
            maxLength={LIMITS.telefono.max}
          />
        </FormField>
      </div>

      {apiError && <p className="mt-2 text-sm text-red-500 animate-in fade-in">{apiError}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <AppButton
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </AppButton>
        <AppButton
          type="submit"
          disabled={!isValid || !isDirty || isSubmitting}
          loading={isSubmitting}
        >
          {isEditing ? 'Guardar Cambios' : 'Guardar Cliente'}
        </AppButton>
      </div>
    </form>
  );
}

export default ClienteForm;
