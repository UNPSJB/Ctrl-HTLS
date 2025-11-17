import { Edit, Trash2, Eye } from 'lucide-react';
import TableButton from '@ui/TableButton';
import { useHotelsData } from '@hooks/useHotelsData';
import Calificacion from '@components/hotel/Calificacion';
import { Loading } from '@ui/Loading';

const AdminHotelList = () => {
  const { hoteles, loading, error } = useHotelsData();

  const handleEdit = () => {
    // Sin funcionalidad
  };

  const handleDelete = () => {
    // Sin funcionalidad
  };

  const handleView = () => {
    // Sin funcionalidad
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow dark:border-red-700 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  if (!hoteles || hoteles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No hay hoteles para mostrar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lista de Hoteles
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Gestiona todos los hoteles registrados en el sistema
        </p>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Hotel
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Ubicación
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Categoría
              </th>
              <th className="p-4 text-right font-semibold text-gray-900 dark:text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {hoteles.map((hotel) => (
              <tr
                key={hotel.hotelId}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {hotel.nombre}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {hotel.ubicacion.nombreCiudad}
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {hotel.ubicacion.nombreProvincia},{' '}
                      {hotel.ubicacion.nombrePais}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <Calificacion estrellas={hotel.categoria.estrellas} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <TableButton
                      variant="view"
                      icon={Eye}
                      onClick={() => handleView()}
                      aria-label="Ver detalles del hotel"
                    />
                    <TableButton
                      variant="edit"
                      icon={Edit}
                      onClick={() => handleEdit()}
                      aria-label="Editar hotel"
                    />
                    <TableButton
                      variant="delete"
                      icon={Trash2}
                      onClick={() => handleDelete()}
                      aria-label="Eliminar hotel"
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

export default AdminHotelList;
