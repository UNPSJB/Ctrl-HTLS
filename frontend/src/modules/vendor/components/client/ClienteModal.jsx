import { useState, useEffect } from 'react';
import { Search, User, UserPlus, Edit } from 'lucide-react';
import Modal from '@ui/Modal';
import { useClienteSearch } from '@vendor-hooks/useClienteSearch';
import ClienteForm from './ClienteForm';
import { useCliente } from '@vendor-context/ClienteContext';
import { capitalizeWords } from '@/utils/stringUtils';
import { FormField, TextInput } from '@/components/ui/form';
import AppButton from '@/components/ui/AppButton';

// Modal de asignación de cliente para el proceso de reserva
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

  // 'search' = pestaña de búsqueda, 'create' = pestaña de nuevo cliente, 'edit' = editando cliente encontrado
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
  };

  const handleSelectClient = () => {
    if (searchResult) {
      selectClient(searchResult);
      onClienteSelected?.(searchResult);
      onClose();
    }
  };

  // Formatear y seleccionar al cliente recién creado
  const handleClienteCreado = (nuevoCliente) => {
    const formattedClient = {
      ...nuevoCliente,
      nombreOriginal: nuevoCliente.nombre,
      nombre: `${nuevoCliente.nombre} ${nuevoCliente.apellido}`,
      documento: nuevoCliente.numeroDocumento,
    };
    setSearchResult(formattedClient);
    selectClient(formattedClient);
    setView('search');
  };

  // Formatear y seleccionar al cliente editado
  const handleClienteEditado = (clienteEditado) => {
    const formattedClient = {
      ...clienteEditado,
      nombreOriginal: clienteEditado.nombre,
      nombre: `${clienteEditado.nombre} ${clienteEditado.apellido}`,
      documento: clienteEditado.numeroDocumento,
    };
    setSearchResult(formattedClient);
    selectClient(formattedClient);
    setView('search');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  // Determinar si estamos en la pestaña de búsqueda (incluye vista de edición)
  const isSearchTab = view === 'search' || view === 'edit';

  return (
    <Modal
      onClose={onClose}
      title="Asignar Cliente"
      description="Identifique al cliente para finalizar la reserva."
      hideFooter={view !== 'search'}
      cancelLabel="Cancelar"
      onConfirm={
        view === 'search' && searchResult ? handleSelectClient : undefined
      }
      confirmLabel="Confirmar Reserva"
    >
      <div className="flex flex-col gap-4">
        {/* Sistema de Pestañas - Se oculta al editar */}
        {view !== 'edit' && (
          <div className="-mt-2 mb-4 flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setView('search')}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
                isSearchTab
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Buscar Cliente
            </button>
            <button
              type="button"
              onClick={() => setView('create')}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
                view === 'create'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Nuevo Cliente
            </button>
          </div>
        )}

        {/* ─── Contenido de la pestaña Buscar ─── */}
        {view === 'search' && (
          <>
            {/* Campo de búsqueda por documento */}
            <FormField label="Documento de Identidad (DNI/CUIL)">
              <div className="flex gap-3">
                <div className="flex-1">
                  <TextInput
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej: 30-12345678-9"
                    value={documentNumber}
                    onChange={(e) =>
                      setDocumentNumber(e.target.value.replace(/\D/g, ''))
                    }
                    onKeyPress={handleKeyPress}
                    maxLength={11}
                    autoFocus
                  />
                </div>
                <AppButton
                  onClick={handleSearchClick}
                  disabled={isSearching || !documentNumber.trim()}
                  loading={isSearching}
                  icon={Search}
                >
                  Buscar
                </AppButton>
              </div>
            </FormField>

            {/* Estado vacío: antes de buscar */}
            {!searchResult && !error && !isSearching && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <Search className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  Ingrese el número de documento del cliente para recuperar sus
                  datos.
                </p>
              </div>
            )}

            {/* Estado de carga */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                  <Search className="h-7 w-7 animate-pulse text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Verificando cliente...
                </p>
              </div>
            )}

            {/* Resultado encontrado */}
            {searchResult && !isSearching && (
              <div className="animate-in fade-in flex gap-4 duration-300">
                {/* Columna izquierda: datos del cliente */}
                <div className="flex-1 space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Nombre Completo
                      </span>
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {capitalizeWords(searchResult.nombre)}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        {capitalizeWords(searchResult.tipoDocumento || 'DNI')}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {searchResult.numeroDocumento || searchResult.documento}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Teléfono
                      </span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {searchResult.telefono || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Email
                      </span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {searchResult.email || 'No registrado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Columna derecha: puntos + botón editar */}
                <div className="w-50 flex flex-col items-center gap-3">
                  <div className="flex w-full flex-1 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Puntos Acumulados
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                        {searchResult.puntos ?? 0}
                      </span>
                      <span className="text-sm font-semibold text-blue-500/70 dark:text-blue-400/70">
                        pts
                      </span>
                    </div>
                  </div>
                  <AppButton
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => setView('edit')}
                    fullWidth
                  >
                    Editar Cliente
                  </AppButton>
                </div>
              </div>
            )}

            {/* Cliente no encontrado */}
            {error && !isSearching && !searchResult && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                  <Search className="h-7 w-7 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-200">
                  Cliente No Encontrado
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  No hemos encontrado clientes asociados al documento{' '}
                  <span className="font-semibold">{documentNumber}</span>. Puede
                  registrar uno nuevo desde la pestaña "Nuevo Cliente".
                </p>
              </div>
            )}
          </>
        )}

        {/* ─── Contenido de la pestaña Nuevo Cliente ─── */}
        {view === 'create' && (
          <ClienteForm
            initialDocumento={documentNumber}
            onCancel={() => setView('search')}
            onSuccess={handleClienteCreado}
          />
        )}

        {/* ─── Vista de Edición (sin tabs visibles) ─── */}
        {view === 'edit' && (
          <ClienteForm
            initialDocumento={documentNumber}
            cliente={searchResult}
            onCancel={() => setView('search')}
            onSuccess={handleClienteEditado}
          />
        )}
      </div>
    </Modal>
  );
}

export default ClienteModal;
