import { createContext, useContext, useMemo, useCallback } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

const ClienteContext = createContext(undefined);
const STORAGE_KEY = 'clienteState';

export function ClienteProvider({ children }) {
  const [client, setClient] = usePersistedState(STORAGE_KEY, null);

  const selectClient = useCallback(
    (cliente) => {
      setClient(cliente);
    },
    [setClient]
  );

  const clearClient = useCallback(() => {
    setClient(null);
  }, [setClient]);

  const value = useMemo(
    () => ({ client, selectClient, clearClient }),
    [client, selectClient, clearClient]
  );

  return (
    <ClienteContext.Provider value={value}>{children}</ClienteContext.Provider>
  );
}

export function useCliente() {
  const ctx = useContext(ClienteContext);
  if (ctx === undefined)
    throw new Error('useCliente debe usarse dentro de ClienteProvider');
  return ctx;
}
