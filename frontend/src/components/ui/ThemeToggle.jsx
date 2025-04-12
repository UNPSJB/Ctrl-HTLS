import { useContext } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="group p-2 flex items-center justify-center"
    >
      {theme === 'dark' ? (
        <Sun className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-yellow-500" />
      ) : (
        <Moon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
      )}
    </button>
  );
};

export default ThemeToggle;
