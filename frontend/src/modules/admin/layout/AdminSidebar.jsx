import { useContext, useMemo } from 'react';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  LogOut,
  Moon,
  Sun,
  MapPin,
  Contact
} from 'lucide-react';
import { ThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo-dark.svg';
import { NavLink } from 'react-router-dom';

// Barra lateral de navegación para el módulo Admin
function AdminSidebar({ onClose }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  const logo = useMemo(
    () => (theme === 'dark' ? logoDark : logoLight),
    [theme]
  );

  // Elementos del menú de navegación
  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin',
    },
    {
      title: 'Hoteles',
      icon: Building2,
      path: '/admin/hoteles',
    },
    {
      title: 'Personal',
      icon: UserCheck,
      path: '/admin/personal',
    },
    {
      title: 'Clientes',
      icon: Users,
      path: '/admin/clientes',
    },
    {
      title: 'Ubicación',
      icon: MapPin,
      path: '/admin/ubicacion',
    },
    {
      title: 'Encargados',
      icon: Contact,
      path: '/admin/encargados',
    },
  ];

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

      {/* Logo y Nombre de Marca */}
      <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6 dark:border-gray-800">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Menú de Navegación Principal */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Menu Principal
        </div>

        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="h-5 w-5 transition-colors group-hover:text-gray-900 dark:group-hover:text-white" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Sección inferior con usuario y configuración de tema */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50">

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user?.rol}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                title="Cambiar tema"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
