import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { useState } from 'react';

const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'le', nombre: 'LE' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
];

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

  const inputBaseClasses =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200';
  const selectBaseClasses = `${inputBaseClasses} appearance-none`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Crear Nuevo Cliente
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre *
          </label>
          <input
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            className={inputBaseClasses}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-500">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Apellido *
          </label>
          <input
            {...register('apellido', {
              required: 'El apellido es obligatorio',
            })}
            className={inputBaseClasses}
          />
          {errors.apellido && (
            <p className="mt-1 text-sm text-red-500">
              {errors.apellido.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Documento *
          </label>
          <select
            {...register('tipoDocumento', { required: 'Seleccione un tipo' })}
            className={selectBaseClasses}
          >
            {tiposDocumento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de Documento *
          </label>
          <input
            {...register('numeroDocumento', {
              required: 'El documento es obligatorio',
            })}
            readOnly
            className={`${inputBaseClasses} cursor-not-allowed bg-gray-100 dark:bg-gray-800`}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <input
            type="email"
            {...register('email', { required: 'El email es obligatorio' })}
            className={inputBaseClasses}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Teléfono
          </label>
          <input
            type="text"
            inputMode="numeric"
            {...register('telefono')}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              setValue('telefono', numericValue, { shouldValidate: true });
            }}
            className={inputBaseClasses}
          />
        </div>
      </div>

      {apiError && <p className="mt-2 text-sm text-red-500">{apiError}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
        </button>
      </div>
    </form>
  );
}

export default ClienteForm;
