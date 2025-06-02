import { createContext, useState, useEffect } from 'react';

// Crear el contexto para el tema
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Leer el tema inicial desde el localStorage o establecerlo en "dark" por defecto
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    // Guardar el tema en el localStorage cada vez que cambie
    localStorage.setItem('theme', theme);

    // Agregar o remover la clase 'dark' en el elemento raíz del documento según el tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Función para alternar entre "light" y "dark"
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
