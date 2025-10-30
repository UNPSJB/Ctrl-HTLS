import { useState } from 'react';
import { Search, User, UserPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import ClienteDetailsModal from './ClienteDetailsModal';
import { useClienteSearch } from '@/hooks/useClienteSearch';
import ClienteForm from './ClienteForm';
import { useCliente } from '@context/ClienteContext';

function ClienteModal({ onClose, onClienteSelected }) {
  const {
    documentNumber,
    setDocumentNumber,
    searchResult,
    isSearching,
    error,
    handleSearch,
    handleKeyPress,
    setSearchResult,
  } = useClienteSearch();

  const { selectClient } = useCliente();
  const [view, setView] = useState('search');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleSelectClient = () => {
    if (searchResult) {
      onClienteSelected?.(searchResult);
      onClose();
    }
  };

  const handleClienteCreado = (nuevoCliente) => {
    const formattedClient = {
      ...nuevoCliente,
      nombre: `${nuevoCliente.nombre} ${nuevoCliente.apellido}`,
      documento: nuevoCliente.numeroDocumento,
    };
    setSearchResult(formattedClient);
    selectClient(formattedClient);
    setView('search');
  };

  return (
    <>
      <Modal onClose={onClose}>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {view === 'search' ? (
            <>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
                <Search className="h-6 w-6" />
                Buscar Cliente
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-400">
                Busca un cliente por su número de documento para asociar con la
                reserva.
              </p>
              <div className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ingrese número de documento"
                    value={documentNumber}
                    onChange={(e) =>
                      setDocumentNumber(e.target.value.replace(/\D/g, ''))
                    }
                    onKeyPress={handleKeyPress}
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-700 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    autoFocus
                  />
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

              {searchResult && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
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
                      Ver detalles
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
              )}

              {error && !isSearching && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        {error}
                      </p>
                      <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                        Puedes crear un nuevo cliente con este documento.
                      </p>
                    </div>
                    <button
                      onClick={() => setView('create')}
                      className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Crear Cliente
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ClienteForm
              initialDocumento={documentNumber}
              onCancel={() => setView('search')}
              onClienteCreado={handleClienteCreado}
            />
          )}
        </div>
      </Modal>

      {isDetailsModalOpen && searchResult && (
        <ClienteDetailsModal
          cliente={searchResult}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </>
  );
}

export default ClienteModal;
