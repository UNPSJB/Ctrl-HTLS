import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import TableButton from '@ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { Loading } from '@ui/Loading';

const VendedoresList = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar los datos reales desde el backend
  useEffect(() => {
    fetchVendedores();
  }, []);

  const fetchVendedores = async () => {
    try {
      setLoading(true);
      // El endpoint /vendedores devuelve la lista de empleados con rol 'vendedor'
      const response = await axiosInstance.get('/vendedores');
      setVendedores(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    console.log('Editar vendedor con ID:', id);
    // Aquí podrías implementar la navegación o apertura de modal de edición
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este vendedor?')) {
      try {
        // Se utiliza el endpoint genérico de empleados para eliminar
        await axiosInstance.delete(`/empleado/${id}`);
        // Actualizamos el estado local para reflejar el cambio inmediatamente
        setVendedores(vendedores.filter((v) => v.id !== id));
        alert('Vendedor eliminado con éxito');
      } catch (err) {
        // El backend valida si tiene ventas pendientes o está asignado a un hotel
        alert(err.response?.data?.error || 'No se pudo eliminar el vendedor');
      }
    }
  };

  const handleView = (id) => {
    console.log('Ver detalles del vendedor con ID:', id);
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow dark:border-red-700 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={fetchVendedores}
          className="mt-4 text-sm font-medium text-red-700 underline hover:text-red-800"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

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
                  {/* Se eliminó la línea que mostraba el ID */}
                  <p className="font-medium text-gray-900 dark:text-white">
                    {vendedor.nombre}
                  </p>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {vendedor.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vendedor.telefono || 'Sin teléfono'}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {vendedor.hotelesPermitidos &&
                    vendedor.hotelesPermitidos.length > 0 ? (
                      vendedor.hotelesPermitidos.map((hotel) => (
                        <span
                          key={hotel.id}
                          className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {hotel.nombre}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-gray-500">
                        Ninguno
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <TableButton
                      variant="view"
                      icon={Eye}
                      onClick={() => handleView(vendedor.id)}
                      aria-label="Ver detalles del vendedor"
                    />
                    <TableButton
                      variant="edit"
                      icon={Edit}
                      onClick={() => handleEdit(vendedor.id)}
                      aria-label="Editar vendedor"
                    />
                    <TableButton
                      variant="delete"
                      icon={Trash2}
                      onClick={() => handleDelete(vendedor.id)}
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
