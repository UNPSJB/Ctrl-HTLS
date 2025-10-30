import { useState, useCallback } from 'react';
import axiosInstance from '@api/axiosInstance';
import { useCliente } from '@context/ClienteContext';

export const useClienteSearch = () => {
  const [documentNumber, setDocumentNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const { selectClient, clearClient } = useCliente();

  const handleSearch = useCallback(async () => {
    if (!documentNumber.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setSearchResult(null);
    clearClient();

    try {
      const response = await axiosInstance.get(
        `/cliente/documento/${documentNumber.trim()}`
      );
      const foundClient = response.data;

      // Adaptamos el objeto del backend para que coincida con lo que la UI espera
      const formattedClient = {
        ...foundClient,
        nombre: `${foundClient.nombre} ${foundClient.apellido}`,
        documento: foundClient.numeroDocumento,
      };

      setSearchResult(formattedClient);
      selectClient(formattedClient);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'No se pudo encontrar al cliente.';
      setError(errorMessage);
      setSearchResult(null);
      clearClient();
    } finally {
      setIsSearching(false);
    }
  }, [documentNumber, selectClient, clearClient]);

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
  };
};
