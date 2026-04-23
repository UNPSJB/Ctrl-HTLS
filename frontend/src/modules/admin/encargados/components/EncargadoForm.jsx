import {
  FormField,
  TextInput,
  SelectInput
} from '@form';


const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
  { id: 'le', nombre: 'Tarjeta de Identidad' },
];

// Sección del formulario para capturar datos del encargado del hotel
const EncargadoForm = ({ register, errors, loading }) => {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
        <div className="h-4 w-1 rounded-full bg-blue-600"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Información del Encargado Administrador
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nombre" required error={errors.encargadoNombre}>
          <TextInput
            id="encargadoNombre"
            placeholder="Ej: Juan Carlos"
            disabled={loading}
            {...register('encargadoNombre', {
              required: 'El nombre del encargado es obligatorio',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
              maxLength: {
                value: 50,
                message: 'El nombre no puede superar los 50 caracteres',
              },
            })}
          />
        </FormField>

        <FormField label="Apellido" required error={errors.encargadoApellido}>
          <TextInput
            id="encargadoApellido"
            placeholder="Ej: García López"
            disabled={loading}
            {...register('encargadoApellido', {
              required: 'El apellido del encargado es obligatorio',
              minLength: {
                value: 2,
                message: 'El apellido debe tener al menos 2 caracteres',
              },
              maxLength: {
                value: 50,
                message: 'El apellido no puede superar los 50 caracteres',
              },
            })}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Tipo de Documento" required error={errors.encargadoTipoDocumento}>
          <SelectInput
            {...register('encargadoTipoDocumento', {
              required: 'El tipo de documento es obligatorio',
            })}
            disabled={loading}
          >
            <option value="">Seleccionar tipo de documento</option>
            {tiposDocumento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Número de Documento" required error={errors.encargadoNumeroDocumento}>
          <TextInput
            id="encargadoNumeroDocumento"
            placeholder="Ej: 12345678"
            disabled={loading}
            {...register('encargadoNumeroDocumento', {
              required: 'El número de documento es obligatorio',
              pattern: {
                value: /^[0-9A-Za-z-]+$/,
                message:
                  'El número de documento solo puede contener números, letras y guiones',
              },
              minLength: {
                value: 6,
                message:
                  'El número de documento debe tener al menos 6 caracteres',
              },
              maxLength: {
                value: 20,
                message: 'El número de documento no puede superar los 20 caracteres',
              },
            })}
          />
        </FormField>
      </div>
    </div>
  );
};

export default EncargadoForm;
