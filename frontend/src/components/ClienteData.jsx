import { useCliente } from '@context/ClienteContext';

function ClienteData() {
  const { client } = useCliente();

  if (!client) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No hay cliente seleccionado. Usá la búsqueda para seleccionar uno.
        </p>
      </div>
    );
  }

  const initials = (client.nombre || '')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: avatar + datos */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold">
            {initials || 'UX'}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {client.nombre}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              DNI:{' '}
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {client.documento}
              </span>
            </p>
          </div>
        </div>

        {/* Right: puntos (énfasis) */}
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Puntos acumulados
          </span>
          <span className="mt-1 inline-block text-3xl font-extrabold leading-none text-gray-900 dark:text-white">
            {client.puntos ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClienteData;
