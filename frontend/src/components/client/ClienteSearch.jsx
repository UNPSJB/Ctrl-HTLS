import { useState } from 'react';
import { Search, User, UserPlus } from 'lucide-react';
import ClienteDetailsModal from './ClienteDetailsModal';
import clientesData from '@data/clientes.json';
import { useCliente } from '@context/ClienteContext';

function ClienteSearch() {
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddClient = () => {
    console.log('Ingresar cliente con documento:', documentNumber);
  };

  return (
    <>
      <div className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg transition-all duration-300 p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Búsqueda de Clientes
          </h1>

          <div className="mb-8">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ingrese número de documento"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="p-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 w-full text-gray-700 dark:text-gray-200"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !documentNumber.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {searchResult && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center gap-4 px-5 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <User className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                  </div>

                  <div className="flex items-baseline gap-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                      {searchResult.nombre}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      DNI:{' '}
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {searchResult.documento}
                      </span>
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Puntos:{' '}
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {searchResult.puntos ?? 0}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline whitespace-nowrap"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          )}

          {searchResult === null && hasSearched && !isSearching && (
            <div className="flex items-center justify-between gap-4 mt-4">
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium pl-1">
                  No se encontró ningún cliente con el documento{' '}
                  <span className="font-bold">{documentNumber}</span>
                </p>
              </div>
              <div>
                <button
                  onClick={handleAddClient}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Ingresar Cliente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && searchResult && (
        <ClienteDetailsModal
          cliente={searchResult}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default ClienteSearch;
