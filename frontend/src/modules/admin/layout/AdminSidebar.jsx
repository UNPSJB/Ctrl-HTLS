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
      path: '/admin/hoteles',
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
                        end={sub.path === '/admin'} // Add end prop if path is exactly /admin
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
                // Use 'end' if the path is the root admin path '/admin' to avoid matching all sub-routes
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
            )}
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50">
          {/* User Info & Actions - Simplified */}
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
