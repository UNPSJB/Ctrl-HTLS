import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, User } from 'lucide-react';
import Modal from '@ui/Modal';

const EditarClienteModal = ({ cliente, onClose, onActualizado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoDocumento: '',
    numeroDocumento: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        tipoDocumento: cliente.tipoDocumento || 'dni',
        numeroDocumento: cliente.numeroDocumento || '',
      });
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Intentamos la actualización (Dará el error de email hasta que arreglen el backend)
      await axiosInstance.put(`/cliente/${cliente.id}`, formData);
      toast.success('Cliente actualizado correctamente');
      onActualizado();
      onClose();
    } catch (error) {
      // Captura el error "column Encargado.email does not exist" y lo muestra
      const mensaje = error.response?.data?.error || 'Error al actualizar';
      toast.error(mensaje);
      console.error('Error detectado en backend:', mensaje);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3 border-b pb-4 dark:border-gray-700">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold dark:text-white">
            Editar Datos del Cliente
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                Documento (No editable)
              </label>
              <input
                type="text"
                value={formData.numeroDocumento}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-gray-100 dark:bg-gray-800`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                'Procesando...'
              ) : (
                <>
                  <Save className="h-4 w-4" /> Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditarClienteModal;
