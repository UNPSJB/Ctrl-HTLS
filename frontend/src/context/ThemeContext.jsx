import { createContext, useContext, useEffect, useState } from 'react';

// Crear el contexto del tema
const ThemeContext = createContext();

// Hook personalizado para usar el contexto del tema
export const useTheme = () => useContext(ThemeContext);

// Proveedor del contexto del tema
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');

  // Efecto para aplicar el tema al cargar el componente y cuando cambia el tema
  useEffect(() => {
    const root = window.document.documentElement;

    // Función para aplicar el tema
    const applyTheme = (theme) => {
      root.classList.remove('light', 'dark');

      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.add('light');
      } else if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      }
    };

    // Obtener el tema almacenado en localStorage o establecer 'system' por defecto
    const storedTheme = localStorage.getItem('theme') || 'system';
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  // Función para cambiar el tema
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Aplicar el tema inmediatamente después de cambiarlo
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.add('light');
    } else if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
