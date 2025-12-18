import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo / Título */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-500">
            Ctrl-HTLS
          </span>
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="mx-2 h-8 w-[1px] bg-gray-200 dark:bg-gray-700" />

          {/* Perfil y Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
              className="flex items-center gap-3 rounded-full p-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar />
              <div className="hidden flex-col text-left md:flex">
                <span className="text-sm font-semibold leading-none text-gray-900 dark:text-white">
                  {user?.nombre}
                </span>
                <span className="text-[11px] capitalize text-gray-500 dark:text-gray-400">
                  {user?.rol}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Menú Desplegable */}
            {isMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700 md:hidden">
                  <p className="text-sm font-bold dark:text-white">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{user?.rol}</p>
                </div>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                  <User size={16} />
                  Mi Perfil
                </button>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Settings size={16} />
                  Configuración
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
