import { User, FileText, Phone } from 'lucide-react';
import Modal from './Modal';

const ClienteDetailsModal = ({ cliente, onClose }) => {
  if (!cliente) return null;

  return (
    <Modal onClose={onClose}>
      <div className="p-6 overflow-y-auto flex flex-col flex-1 gap-4 custom-scrollbar">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <User className="w-6 h-6" />
          {cliente.nombre}
        </h2>

        <p className="text-gray-700 dark:text-gray-400 mb-4">
          Información completa del cliente para verificación
        </p>

        {/* Información Personal */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FileText className="w-5 h-5" />
            Información Personal
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nombre completo
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {cliente.nombre}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Número de documento
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {cliente.documento}
              </p>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Phone className="w-5 h-5" />
            Información de Contacto
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Teléfono
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {cliente.telefono}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {cliente.email}
              </p>
            </div>
          </div>
        </div>

        {/* Información de Registro */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            Información de Registro
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fecha de registro
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {cliente.fecha_registro}
              </p>
            </div>
          </div>
        </div>

        {/* Puntos acumulados */}
        <div className="bg-white dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-700 rounded-lg mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Total de Puntos Acumulados:
            </span>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {cliente.puntos} pts
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ClienteDetailsModal;
