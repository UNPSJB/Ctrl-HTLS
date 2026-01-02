import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import TableButton from '@ui/TableButton';
import axiosInstance from '@api/axiosInstance';
import { Loading } from '@ui/Loading';
import EditarClienteModal from '@/components/client/EditarClienteModal';

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);

  // Estados para la edición
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/clientes');
      setClientes(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setClienteAEditar(cliente);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await axiosInstance.delete(`/cliente/${id}`);
        setClientes(clientes.filter((c) => c.id !== id));
        alert('Cliente eliminado exitosamente');
      } catch (err) {
        alert(err.response?.data?.error || 'No se pudo eliminar el cliente');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Lista de Clientes
          </h3>
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
                <th className="p-4 text-right font-semibold text-gray-900 dark:text-white">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <td className="p-4 font-medium text-gray-900 dark:text-white">
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {cliente.email}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    <span className="mr-2 text-xs font-bold uppercase">
                      {cliente.tipoDocumento}
                    </span>
                    {cliente.numeroDocumento}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <TableButton
                        variant="edit"
                        icon={Edit}
                        onClick={() => handleEdit(cliente)}
                      />
                      <TableButton
                        variant="delete"
                        icon={Trash2}
                        onClick={() => handleDelete(cliente.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <EditarClienteModal
          cliente={clienteAEditar}
          onClose={() => {
            setIsEditModalOpen(false);
            setClienteAEditar(null);
          }}
          onActualizado={fetchClientes}
        />
      )}
    </>
  );
};

export default ClientesList;
