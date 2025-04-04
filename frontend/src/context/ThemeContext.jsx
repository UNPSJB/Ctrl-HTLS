import { createContext, useState, useEffect } from 'react';

// Crear el contexto para el tema
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Establecemos el tema por defecto en "dark" (ya no usamos la opción del sistema)
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
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
