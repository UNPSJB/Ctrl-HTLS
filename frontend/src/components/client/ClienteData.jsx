import { useCliente } from '@context/ClienteContext';

function ClienteData() {
  const { client } = useCliente();

  if (!client) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
    <div className="rounded-lg bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-4">
        {/* Left: avatar + datos */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
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
