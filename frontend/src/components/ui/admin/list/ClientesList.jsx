import { Edit, Trash2, Eye } from 'lucide-react';
import TableButton from '@ui/TableButton';
import clientesData from '@data/clientes.json';

const ClientesList = () => {
  const clientes = clientesData;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPuntosColor = (puntos) => {
    if (puntos >= 2000)
      return 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (puntos >= 1000)
      return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
  };

  const handleEdit = () => {
    // Sin funcionalidad
  };

  const handleDelete = () => {
    // Sin funcionalidad
  };

  const handleView = () => {
    // Sin funcionalidad
  };

  if (!clientes || clientes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No hay clientes para mostrar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lista de Clientes
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Gestiona todos los clientes registrados en el sistema
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Usuario
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Documento
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Contacto
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Registro
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Puntos
              </th>
              <th className="p-4 text-right font-semibold text-gray-900 dark:text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cliente.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cliente.email}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {cliente.documento}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {cliente.telefono}
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {formatDate(cliente.fecha_registro)}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPuntosColor(cliente.puntos)}`}
                  >
                    {cliente.puntos.toLocaleString()} pts
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <TableButton
                      variant="view"
                      icon={Eye}
                      onClick={() => handleView()}
                      aria-label="Ver detalles del cliente"
                    />
                    <TableButton
                      variant="edit"
                      icon={Edit}
                      onClick={() => handleEdit()}
                      aria-label="Editar cliente"
                    />
                    <TableButton
                      variant="delete"
                      icon={Trash2}
                      onClick={() => handleDelete()}
                      aria-label="Eliminar cliente"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientesList;
