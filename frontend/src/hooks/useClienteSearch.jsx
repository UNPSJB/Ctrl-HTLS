import { useState, useCallback } from 'react';
import axiosInstance from '@api/axiosInstance';
// import { useCliente } from '@context/ClienteContext'; // <-- Eliminado

export const useClienteSearch = () => {
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // const { selectClient, clearClient } = useCliente(); // <-- Eliminado

  const handleSearch = useCallback(async () => {
    if (!documentNumber.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setSearchResult(null);
    // clearClient(); // <-- Eliminado

    try {
      const response = await axiosInstance.get(
        `/cliente/documento/${documentNumber.trim()}`
      );
      const foundClient = response.data;

      const formattedClient = {
        ...foundClient,
        nombre: `${foundClient.nombre} ${foundClient.apellido}`,
        documento: foundClient.numeroDocumento,
      };

      setSearchResult(formattedClient);
      // selectClient(formattedClient); // <-- Eliminado
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'No se pudo encontrar al cliente.';
      setError(errorMessage);
      setSearchResult(null);
      // clearClient(); // <-- Eliminado
    } finally {
      setIsSearching(false);
    }
  }, [documentNumber]); // <-- Dependencias actualizadas

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return {
    documentNumber,
    setDocumentNumber,
    searchResult,
    isSearching,
    hasSearched,
    error,
    handleSearch,
    handleKeyPress,
    setSearchResult, // Exportamos esto para que el modal pueda usarlo
  };
};
