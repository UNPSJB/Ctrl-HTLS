

const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
  { id: 'le', nombre: 'Tarjeta de Identidad' },
];

// Sección del formulario para capturar datos del encargado del hotel
const EncargadoForm = ({ register, errors, loading }) => {
  const inputClass = (error) =>
    `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all shadow-sm`;

  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
  const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
        <div className="h-4 w-1 rounded-full bg-blue-600"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Información del Encargado Administrador
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="encargadoNombre" className={labelClass}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="encargadoNombre"
            type="text"
            placeholder="Ej: Juan Carlos"
            disabled={loading}
            {...register('encargadoNombre', {
              required: 'El nombre del encargado es obligatorio',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
            })}
            className={inputClass(errors.encargadoNombre)}
          />
          {errors.encargadoNombre && (
            <p className={errorClass}>
              {errors.encargadoNombre.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="encargadoApellido" className={labelClass}>
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id="encargadoApellido"
            type="text"
            placeholder="Ej: García López"
            disabled={loading}
            {...register('encargadoApellido', {
              required: 'El apellido del encargado es obligatorio',
              minLength: {
                value: 2,
                message: 'El apellido debe tener al menos 2 caracteres',
              },
            })}
            className={inputClass(errors.encargadoApellido)}
          />
          {errors.encargadoApellido && (
            <p className={errorClass}>
              {errors.encargadoApellido.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Tipo de Documento <span className="text-red-500">*</span>
          </label>
          <select
            {...register('encargadoTipoDocumento', {
              required: 'El tipo de documento es obligatorio',
            })}
            disabled={loading}
            className={inputClass(errors.encargadoTipoDocumento)}
          >
            <option value="">Seleccionar tipo de documento</option>
            {tiposDocumento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.encargadoTipoDocumento && (
            <p className={errorClass}>
              {errors.encargadoTipoDocumento.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="encargadoNumeroDocumento" className={labelClass}>
            Número de Documento <span className="text-red-500">*</span>
          </label>
          <input
            id="encargadoNumeroDocumento"
            type="text"
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
            })}
            className={inputClass(errors.encargadoNumeroDocumento)}
          />
          {errors.encargadoNumeroDocumento && (
            <p className={errorClass}>
              {errors.encargadoNumeroDocumento.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncargadoForm;
