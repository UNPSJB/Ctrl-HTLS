import { useState } from 'react';
import { Search, User, UserPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import ClienteDetailsModal from './ClienteDetailsModal';
import clientesData from '@data/clientes.json';
import { useCliente } from '@context/ClienteContext';

function ClienteModal({ onClose, onClienteSelected }) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { selectClient, clearClient } = useCliente();

  const handleSearch = () => {
    if (!documentNumber.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const foundClient = clientesData.find(
        (c) => c.documento === documentNumber.trim()
      );
      setSearchResult(foundClient || null);
      setIsSearching(false);

      if (foundClient) {
        selectClient(foundClient);
        console.log('Cliente seleccionado en contexto:', foundClient);
      } else {
        clearClient();
        console.log('No se encontró cliente. Cliente en contexto limpiado.');
      }
    }, 800);
  };

  const handleSelectClient = () => {
    if (searchResult) {
      onClienteSelected?.(searchResult);
      onClose();
    }
  };

  const handleCloseDetailsModal = () => setIsDetailsModalOpen(false);

  const handleAddClient = () => {
    console.log('Ingresar cliente con documento:', documentNumber);
    // Aquí podrías abrir otro modal para crear cliente o navegar a otra página
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Modal onClose={onClose}>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
            <Search className="h-6 w-6" />
            Buscar Cliente
          </h2>

          <p className="mb-4 text-gray-700 dark:text-gray-400">
            Busca un cliente por su número de documento para asociar con la
            reserva
          </p>

          {/* Campo de búsqueda */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ingrese número de documento"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-700 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !documentNumber.trim()}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search className="h-5 w-5" />
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Resultado de búsqueda exitosa */}
          {searchResult && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <div className="p-4">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                    <User className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {searchResult.nombre}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        DNI:{' '}
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {searchResult.documento}
                        </span>
                      </span>
                      <span>
                        Puntos:{' '}
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {searchResult.puntos ?? 0}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Ver detalles completos
                  </button>

                  <button
                    onClick={handleSelectClient}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                  >
                    <User className="h-4 w-4" />
                    Seleccionar Cliente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resultado de búsqueda sin resultados */}
          {searchResult === null && hasSearched && !isSearching && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    No se encontró ningún cliente con el documento{' '}
                    <span className="font-bold">{documentNumber}</span>
                  </p>
                  <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                    Puedes crear un nuevo cliente con este documento
                  </p>
                </div>
                <button
                  onClick={handleAddClient}
                  className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear Cliente
                </button>
              </div>
            </div>
          )}

          {/* Instrucciones de uso */}
          {!hasSearched && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="mb-1 font-medium text-blue-900 dark:text-blue-100">
                    ¿Cómo buscar un cliente?
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Ingresa el número de documento completo</li>
                    <li>• Presiona Enter o haz clic en Buscar</li>
                    <li>• Si el cliente existe, podrás seleccionarlo</li>
                    <li>• Si no existe, podrás crear uno nuevo</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de detalles del cliente */}
      {isDetailsModalOpen && searchResult && (
        <ClienteDetailsModal
          cliente={searchResult}
          onClose={handleCloseDetailsModal}
        />
      )}
    </>
  );
}

export default ClienteModal;
