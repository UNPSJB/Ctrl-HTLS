import { useState, useEffect } from 'react';

export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
