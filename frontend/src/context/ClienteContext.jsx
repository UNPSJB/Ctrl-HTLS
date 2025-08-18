import { createContext, useContext, useState, useMemo } from 'react';

/**
 * ClienteContext
 * - Guarda el cliente seleccionado en el flujo de venta.
 * - Provee funciones para seleccionar/limpiar cliente.
 *
 * Nota: este contexto es ligero — no persiste en localStorage por ahora.
 */

const ClienteContext = createContext(undefined);

export function ClienteProvider({ children }) {
  const [client, setClient] = useState(null);

  const selectClient = (cliente) => {
    // cliente: objeto tal como viene en clientes.json { id, nombre, puntos, ... }
    setClient(cliente);
  };

  const clearClient = () => setClient(null);

  const value = useMemo(
    () => ({ client, selectClient, clearClient }),
    [client]
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
