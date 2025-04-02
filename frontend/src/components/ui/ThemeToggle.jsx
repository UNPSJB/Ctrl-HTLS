import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-4">
      {/* Botón para el modo claro */}
      <button
        onClick={() => toggleTheme('light')}
        className={`p-2 rounded-full ${theme === 'light' ? 'bg-gray-200' : ''}`}
        aria-label="Activar modo claro"
      >
        <Sun className="w-6 h-6" />
      </button>

      {/* Botón para el modo oscuro */}
      <button
        onClick={() => toggleTheme('dark')}
        className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}
        aria-label="Activar modo oscuro"
      >
        <Moon className="w-6 h-6" />
      </button>

      {/* Botón para el modo del sistema */}
      <button
        onClick={() => toggleTheme('system')}
        className={`p-2 rounded-full ${theme === 'system' ? 'bg-gray-400' : ''}`}
        aria-label="Usar configuración del sistema"
      >
        <Monitor className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ThemeToggle;
