import { useState, useEffect } from 'react';
import { Search, User, UserPlus } from 'lucide-react';
import Modal from '@ui/Modal';
import { useClienteSearch } from '@vendor-hooks/useClienteSearch';
import ClienteForm from './ClienteForm';
import { useCliente } from '@vendor-context/ClienteContext';
import { capitalizeWords } from '@/utils/stringUtils';
import { TextInput } from '@/components/ui/form';
import StateMessage from '@/components/ui/StateMessage';

// Modal de búsqueda y selección de clientes
function ClienteModal({ onClose, onClienteSelected }) {
  const { client, selectClient, clearClient } = useCliente();

  const {
    documentNumber,
    setDocumentNumber,
    searchResult,
    isSearching,
    error,
    handleSearch: performSearch,
    setSearchResult,
  } = useClienteSearch(client?.documento);

  const [view, setView] = useState('search');

  useEffect(() => {
    if (searchResult) {
      if (!client || client.id !== searchResult.id) {
        selectClient(searchResult);
      }
    }
  }, [searchResult, client, selectClient]);

  const handleSearchClick = async () => {
    clearClient();
    await performSearch();
  }

  const handleSelectClient = () => {
    if (searchResult) {
      selectClient(searchResult);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  return (
      <Modal 
        onClose={onClose}
        title={view === 'search' ? (client ? 'Cliente Cargado' : 'Buscar Cliente') : 'Crear Nuevo Cliente'}
        description={view === 'search' ? (client ? 'Verificando datos del cliente actual. Puede buscar otro.' : 'Busca un cliente por su número de documento para asociar con la reserva.') : 'Complete los datos del nuevo cliente.'}
        hideFooter={view !== 'search'}
        cancelLabel="Cancelar"
        onConfirm={view === 'search' && searchResult ? handleSelectClient : undefined}
        confirmLabel="Seleccionar"
      >
        <div className="flex flex-col gap-4">
          {view === 'search' ? (
            <>
              <div className="mb-2">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <TextInput
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ingrese número de documento"
                      value={documentNumber}
                      onChange={(e) =>
                        setDocumentNumber(e.target.value.replace(/\D/g, ''))
                      }
                      onKeyPress={handleKeyPress}
                      maxLength={9}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleSearchClick}
                    disabled={isSearching || !documentNumber.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Search className="h-5 w-5" />
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {isSearching && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Verificando cliente...
                </div>
              )}

              {searchResult && !isSearching && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50 mt-2">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 border-b border-gray-200 pb-5 dark:border-gray-700">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {capitalizeWords(searchResult.nombre)}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {capitalizeWords(searchResult.tipoDocumento || 'DNI')}: {searchResult.numeroDocumento || searchResult.documento}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Email</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{searchResult.email || 'No registrado'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Teléfono</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{capitalizeWords(searchResult.telefono) || 'No registrado'}</span>
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Puntos</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{searchResult.puntos ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && !isSearching && !searchResult && (
                <div className="mt-2">
                  <StateMessage
                    variant="info"
                    title="Cliente No Encontrado"
                    description={
                      client && client.documento === documentNumber
                        ? 'El cliente guardado previamente no se encuentra en el sistema. Puede buscar otro o crearlo con este documento.'
                        : `No hemos encontrado clientes asociados al documento ${documentNumber}. Puede registrar uno nuevo para usarlo en la reserva.`
                    }
                  >
                    <button
                      onClick={() => setView('create')}
                      className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                    >
                      <UserPlus className="h-5 w-5" />
                      Crear Nuevo Cliente
                    </button>
                  </StateMessage>
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
  );
}

export default ClienteModal;
