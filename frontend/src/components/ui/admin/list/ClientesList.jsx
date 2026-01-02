import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import TableButton from '@ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { Loading } from '@ui/Loading';

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar los clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      // Endpoint del backend para obtener todos los clientes
      const response = await axiosInstance.get('/clientes');
      setClientes(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const getPuntosColor = (puntos) => {
    if (puntos >= 2000)
      return 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (puntos >= 1000)
      return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
  };

  const handleEdit = (id) => {
    console.log('Navegar a edición de cliente:', id);
    // Aquí iría la lógica para abrir un modal o navegar a la ruta de edición
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        // Llamada al endpoint DELETE del backend
        await axiosInstance.delete(`/cliente/${id}`);
        // Actualizar la lista local eliminando el registro borrado
        setClientes(clientes.filter((cliente) => cliente.id !== id));
        alert('Cliente eliminado exitosamente');
      } catch (err) {
        // El backend puede devolver errores si el cliente tiene dependencias (ej. reservas activas)
        alert(err.response?.data?.error || 'No se pudo eliminar el cliente');
      }
    }
  };

  const handleView = (id) => {
    console.log('Ver detalles completos del cliente:', id);
    // Aquí se podría abrir un modal con el historial de alquileres del cliente
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow dark:border-red-700 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={fetchClientes}
          className="mt-4 text-sm font-medium text-red-700 underline hover:text-red-800"
        >
          Reintentar carga
        </button>
      </div>
    );
  }

  if (!clientes || clientes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No hay clientes registrados en el sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lista de Clientes
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Gestiona todos los clientes registrados en el sistema
        </p>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Cliente
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Email
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Documento
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                Contacto
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
                  <p className="font-medium text-gray-900 dark:text-white">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cliente.email}
                  </p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                      {cliente.tipoDocumento}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {cliente.numeroDocumento}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {cliente.telefono || '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPuntosColor(cliente.puntos)}`}
                  >
                    {(cliente.puntos || 0).toLocaleString()} pts
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <TableButton
                      variant="view"
                      icon={Eye}
                      onClick={() => handleView(cliente.id)}
                      aria-label="Ver detalles del cliente"
                    />
                    <TableButton
                      variant="edit"
                      icon={Edit}
                      onClick={() => handleEdit(cliente.id)}
                      aria-label="Editar cliente"
                    />
                    <TableButton
                      variant="delete"
                      icon={Trash2}
                      onClick={() => handleDelete(cliente.id)}
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
