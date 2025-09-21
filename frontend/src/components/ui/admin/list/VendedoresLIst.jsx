import { Edit, Trash2, Eye } from 'lucide-react';
import TableButton from '@ui/TableButton';
import vendedoresData from '@data/vendedores.json';

const VendedoresList = () => {
  const vendedores = vendedoresData;

  const handleEdit = () => {
    // Sin funcionalidad
  };

  const handleDelete = () => {
    // Sin funcionalidad
  };

  const handleView = () => {
    // Sin funcionalidad
  };

  if (!vendedores || vendedores.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No hay vendedores para mostrar.
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
          Lista de Vendedores
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Gestiona todos los vendedores registrados en el sistema
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Vendedor
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Contacto
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Hoteles Permitidos
              </th>
              <th className="p-4 text-right font-semibold text-gray-900 dark:text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {vendedores.map((vendedor) => (
              <tr
                key={vendedor.id}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vendedor.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {vendedor.id}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {vendedor.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vendedor.telefono}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {vendedor.hotelesPermitidos.map((hotelId, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {hotelId}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <TableButton
                      variant="view"
                      icon={Eye}
                      onClick={() => handleView()}
                      aria-label="Ver detalles del vendedor"
                    />
                    <TableButton
                      variant="edit"
                      icon={Edit}
                      onClick={() => handleEdit()}
                      aria-label="Editar vendedor"
                    />
                    <TableButton
                      variant="delete"
                      icon={Trash2}
                      onClick={() => handleDelete()}
                      aria-label="Eliminar vendedor"
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

export default VendedoresList;
