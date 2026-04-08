import { useContext, useMemo } from 'react'; // Añadimos useContext y useMemo
import { Link } from 'react-router-dom'; // Para que el logo sea un enlace
import { useAuth } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext'; // Importamos el contexto del tema
import ThemeToggle from '@/components/ui/ThemeToggle';
import { LogOut } from 'lucide-react';
import { capitalizeWords } from '@/utils/stringUtils';

// Importamos los logos igual que en AdminHeader
import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo-dark.svg';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme } = useContext(ThemeContext); // Obtenemos el tema actual

  // Lógica para elegir el logo según el tema
  const logo = useMemo(
    () => (theme === 'dark' ? logoDark : logoLight),
    [theme]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo / Título actualizado para usar imagen */}
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="Ir al inicio">
            <img src={logo} alt="Logo" className="h-10" />
          </Link>
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="mx-2 h-8 w-[1px] bg-gray-200 dark:bg-gray-700" />

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-4 pl-2">
            <Link 
              to="/perfil" 
              target="_blank" 
              className="group flex flex-col text-right hover:opacity-80"
            >
              <span className="text-sm font-semibold leading-none text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {capitalizeWords(`${user?.nombre || ''} ${user?.apellido || ''}`.trim())}
              </span>
              <span className="text-[11px] capitalize text-gray-500 dark:text-gray-400">
                {user?.rol}
              </span>
            </Link>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
