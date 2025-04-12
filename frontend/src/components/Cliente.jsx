import { useState } from 'react';
import { Search, User, UserPlus } from 'lucide-react';
import ClienteDetailsModal from './modals/ClienteDetailsModal';
import clientesData from '../data/clientes.json';

export default function Cliente() {
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Maneja la búsqueda simulando una llamada a API
  const handleSearch = () => {
    if (!documentNumber.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const foundClient = clientesData.find(
        (client) => client.documento === documentNumber.trim()
      );
      setSearchResult(foundClient || null);
      setIsSearching(false);
    }, 800);
  };

  // Cierra el modal de detalles del cliente
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Simulación de acción para ingresar cliente
  const handleAddClient = () => {
    console.log('Ingresar cliente con documento:', documentNumber);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg transition-all duration-300 p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Búsqueda de Clientes
          </h1>

          {/* Formulario de búsqueda */}
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

          {/* Resultados de búsqueda */}
          {searchResult && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center gap-4 px-5 py-3">
                {/* Avatar + info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <User className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                      {searchResult.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      DNI: {searchResult.documento}
                    </p>
                  </div>
                </div>

                {/* Botón de detalles */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline whitespace-nowrap"
                >
                  Ver detalles
                </button>
              </div>
            </div>
          )}

          {/* Mensaje de sin resultados y botón para agregar cliente */}
          {searchResult === null && hasSearched && !isSearching && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-red-700 dark:text-red-300">
                No se encontró ningún cliente con el documento {documentNumber}
              </div>
              <button
                onClick={handleAddClient}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-5 h-5" />
                Ingresar Cliente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del cliente */}
      {isModalOpen && searchResult && (
        <ClienteDetailsModal
          cliente={searchResult}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
