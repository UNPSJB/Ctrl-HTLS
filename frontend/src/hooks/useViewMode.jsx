import { useState, useEffect } from 'react';

const useViewMode = (initialMode = 'grid') => {
  const [viewMode, setViewMode] = useState(initialMode);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  return [viewMode, changeViewMode];
};

export default useViewMode;
