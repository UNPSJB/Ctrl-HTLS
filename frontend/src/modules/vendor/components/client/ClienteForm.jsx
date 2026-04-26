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

import { TIPOS_DOCUMENTO } from '@/utils/constants';

// Formulario para la creación de un nuevo cliente refactorizado con componentes UI estandarizados
function ClienteForm({ initialDocumento = '', onCancel, onClienteCreado }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      numeroDocumento: initialDocumento,
      tipoDocumento: 'dni',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const response = await axiosInstance.post('/cliente', data);
      onClienteCreado(response.data);
    } catch (err) {
      setApiError(
        err.response?.data?.error || 'Ocurrió un error al crear el cliente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Crear Nuevo Cliente
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Nombre" required error={errors.nombre}>
          <TextInput
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            placeholder="Ej: Juan"
          />
        </FormField>

        <FormField label="Apellido" required error={errors.apellido}>
          <TextInput
            {...register('apellido', { required: 'El apellido es obligatorio' })}
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
            {...register('numeroDocumento', { required: 'El documento es obligatorio' })}
            readOnly
            disabled
          />
        </FormField>

        <FormField label="Email" required error={errors.email}>
          <EmailInput
            {...register('email', { 
              required: 'El email es obligatorio',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido"
              }
            })}
          />
        </FormField>

        <FormField label="Teléfono" error={errors.telefono}>
          <TelInput
            {...register('telefono')}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              setValue('telefono', numericValue, { shouldValidate: true });
            }}
          />
        </FormField>
      </div>

      {apiError && <p className="mt-2 text-sm text-red-500 animate-in fade-in">{apiError}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
        </button>
      </div>
    </form>
  );
}

export default ClienteForm;

