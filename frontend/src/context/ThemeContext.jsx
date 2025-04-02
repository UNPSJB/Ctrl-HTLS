import { createContext, useState, useEffect } from 'react';

// Crear el contexto para el tema
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Determinar el tema por defecto, por ejemplo, según el sistema del usuario
  const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    // Agregar o remover la clase 'dark' en el elemento raíz del documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Función para alternar entre temas
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
