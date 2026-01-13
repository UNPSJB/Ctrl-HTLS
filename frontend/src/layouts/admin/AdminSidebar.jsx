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
} from 'lucide-react';
import { ThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo-dark.svg';
import { NavLink, useLocation } from 'react-router-dom';

function AdminSidebar({ onClose }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { theme } = useContext(ThemeContext);
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
      description: 'Vista general',
      path: '/admin',
    },
    {
      title: 'Gestión de Hoteles',
      icon: Building2,
      description: 'ABM de hoteles',
      submenu: [
        { title: 'Ver Hoteles', path: '/admin/hoteles' },
        { title: 'Crear Hotel', path: '/admin/hoteles/nuevo' },
        { title: 'Categorías', path: '/admin/hoteles/categorias' },
      ],
    },
    {
      title: 'Gestión de Vendedores',
      icon: UserCheck,
      description: 'ABM de vendedores',
      submenu: [
        { title: 'Ver Vendedores', path: '/admin/vendedores' },
        { title: 'Crear Vendedor', path: '/admin/vendedores/nuevo' },
      ],
    },
    {
      title: 'Gestión de Clientes',
      icon: Users,
      description: 'ABM de clientes',
      submenu: [
        { title: 'Ver Clientes', path: '/admin/clientes' },
        { title: 'Crear Cliente', path: '/admin/clientes/nuevo' },
      ],
    },
    {
      title: 'Reportes',
      icon: BarChart3,
      description: 'Estadísticas',
      submenu: [
        { title: 'Reservas', path: '/admin/reportes/reservas' },
        { title: 'Ingresos', path: '/admin/reportes/ingresos' },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <img src={logo} alt="Logo" className="h-8" />
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menuItems.map((item, idx) => (
          <div key={idx}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => handleToggleSubmenu(item.title)}
                  aria-expanded={openSubmenu === item.title}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${item.submenu.some(sub => location.pathname === sub.path) ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                >
                  <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transform text-gray-400 transition-transform ${openSubmenu === item.title ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {openSubmenu === item.title && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((sub, sidx) => (
                      <NavLink
                        key={sidx}
                        to={sub.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
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
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-900 dark:text-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <div className="text-left">
                  <div className="text-sm font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </div>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-200 bg-gray-50/50 px-4 py-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tema
            </span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 px-2">
            <Avatar />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                {user?.nombre} {user?.apellido}
              </div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <NavLink
              to="/admin/configuracion"
              onClick={onClose}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </NavLink>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
