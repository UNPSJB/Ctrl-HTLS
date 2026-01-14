import { useState, useContext, useMemo } from 'react';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { ThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo-dark.svg';
import { NavLink, useLocation } from 'react-router-dom';

function AdminSidebar({ onClose }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const location = useLocation();

  const logo = useMemo(
    () => (theme === 'dark' ? logoDark : logoLight),
    [theme]
  );

  const handleToggleSubmenu = (title) => {
    setOpenSubmenu((prev) => (prev === title ? null : title));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin',
    },
    {
      title: 'Hoteles',
      icon: Building2,
      submenu: [
        // { title: 'Ver Hoteles', path: '/admin/hoteles' }, // Backend limitation
        { title: 'Crear Hotel', path: '/admin/hoteles/nuevo' },
        { title: 'Categorías', path: '/admin/hoteles/categorias' },
      ],
    },
    {
      title: 'Vendedores',
      icon: UserCheck,
      path: '/admin/vendedores',
    },
    {
      title: 'Clientes',
      icon: Users,
      path: '/admin/clientes', // Changed to single link
    },
    {
      title: 'Reportes',
      icon: BarChart3,
      submenu: [
        { title: 'Reservas', path: '/admin/reportes/reservas' },
        { title: 'Ingresos', path: '/admin/reportes/ingresos' },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-6 dark:border-gray-800">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Menu Principal
        </div>

        {menuItems.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.submenu ? (
              <>
                <button
                  onClick={() => handleToggleSubmenu(item.title)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${item.submenu.some(sub => location.pathname.startsWith(sub.path))
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${item.submenu.some(sub => location.pathname.startsWith(sub.path))
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                    {item.title}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === item.title || item.submenu.some(sub => location.pathname.startsWith(sub.path)) ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {(openSubmenu === item.title || item.submenu.some(sub => location.pathname.startsWith(sub.path))) && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-3 dark:border-gray-800">
                    {item.submenu.map((sub, sidx) => (
                      <NavLink
                        key={sidx}
                        to={sub.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                          }`
                        }
                      >
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
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
            )}
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50">
          {/* User Info */}
          <div className="mb-4 flex items-center gap-3">
            <Avatar />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 rounded-lg bg-white p-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                title="Cambiar tema"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Tema
              </button>
              <NavLink
                to="/admin/configuracion"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-lg bg-white p-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Settings className="h-4 w-4" />
                Ajustes
              </NavLink>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
