import { User } from 'lucide-react';

// Tipos de documento disponibles
const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
  { id: 'le', nombre: 'Tarjeta de Identidad' },
];

const EncargadoForm = ({ register, errors, loading }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <User className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Datos del Encargado
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="encargadoNombre"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre *
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
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.encargadoNombre ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.encargadoNombre && (
            <p className="text-red-500 text-sm">
              {errors.encargadoNombre.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="encargadoApellido"
            className="block text-sm font-medium text-gray-700"
          >
            Apellido *
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
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.encargadoApellido ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.encargadoApellido && (
            <p className="text-red-500 text-sm">
              {errors.encargadoApellido.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Documento *
          </label>
          <select
            {...register('encargadoTipoDocumento', {
              required: 'El tipo de documento es obligatorio',
            })}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.encargadoTipoDocumento
                ? 'border-red-500'
                : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar tipo de documento</option>
            {tiposDocumento.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.encargadoTipoDocumento && (
            <p className="text-red-500 text-sm">
              {errors.encargadoTipoDocumento.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="encargadoNumeroDocumento"
            className="block text-sm font-medium text-gray-700"
          >
            Número de Documento *
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
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.encargadoNumeroDocumento
                ? 'border-red-500'
                : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.encargadoNumeroDocumento && (
            <p className="text-red-500 text-sm">
              {errors.encargadoNumeroDocumento.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncargadoForm;
