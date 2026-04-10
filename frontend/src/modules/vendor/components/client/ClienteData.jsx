import { useCliente } from '@vendor-context/ClienteContext';
import { capitalizeWords } from '@/utils/stringUtils';

// Muestra datos del cliente seleccionado para la vista de pago
function ClienteData() {
  const { client } = useCliente();

  if (!client) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No hay cliente seleccionado. Usá la búsqueda para seleccionar uno.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Nombre y documento */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {capitalizeWords(client.nombre)}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              DNI: {client.documento}
            </span>
          </div>

          {/* Separador vertical */}
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Email */}
          {client.email && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Email</span>
              <p className="font-medium text-gray-800 dark:text-gray-200">{client.email}</p>
            </div>
          )}

          {/* Teléfono */}
          {client.telefono && (
            <>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Teléfono</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">{client.telefono}</p>
              </div>
            </>
          )}
        </div>

        {/* Puntos */}
        <div className="text-right">
          <span className="text-xs text-gray-500 dark:text-gray-400">Puntos</span>
          <p className="text-xl font-extrabold leading-none text-gray-900 dark:text-white">
            {client.puntos ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClienteData;
