import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';

export const useClienteSearch = (initialDocumento = null) => {
  const [documentNumber, setDocumentNumber] = useState(initialDocumento || '');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(!!initialDocumento);
  const [hasSearched, setHasSearched] = useState(!!initialDocumento);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!documentNumber.trim()) {
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setSearchResult(null);

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
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'No se pudo encontrar al cliente.';
      setError(errorMessage);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  }, [documentNumber]);

  useEffect(() => {
    if (initialDocumento) {
      handleSearch();
    }
  }, []);

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
    handleSearch, // Renombramos 'performSearch' de vuelta a 'handleSearch'
    handleKeyPress,
    setSearchResult,
  };
};
