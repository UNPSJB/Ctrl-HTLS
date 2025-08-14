import { useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { ThemeContext } from '@context/ThemeContext';
import ThemeToggle from '@ui/ThemeToggle';
import Avatar from '@components/Avatar';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';

function AdminSidebar({ onClose = () => {} }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { theme } = useContext(ThemeContext);

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
      description: 'Vista general',
    },
    {
      title: 'Gestión de Hoteles',
      icon: Building2,
      path: '/admin/hoteles',
      description: 'ABM de hoteles',
      submenu: [
        { title: 'Ver Hoteles', path: '/admin/hoteles' },
        { title: 'Crear Hotel', path: '/admin/hoteles/crear' },
        { title: 'Categorías', path: '/admin/hoteles/categorias' },
      ],
    },
    {
      title: 'Gestión de Vendedores',
      icon: UserCheck,
      path: '/admin/vendedores',
      description: 'ABM de vendedores',
      submenu: [
        { title: 'Ver Vendedores', path: '/admin/vendedores' },
        { title: 'Crear Vendedor', path: '/admin/vendedores/crear' },
      ],
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      path: '/admin/usuarios',
      description: 'ABM de usuarios',
      submenu: [
        { title: 'Ver Usuarios', path: '/admin/usuarios' },
        { title: 'Crear Usuario', path: '/admin/usuarios/crear' },
      ],
    },
    {
      title: 'Reportes',
      icon: BarChart3,
      path: '/admin/reportes',
      description: 'Estadísticas',
      submenu: [
        { title: 'Reservas', path: '/admin/reportes/reservas' },
        { title: 'Ingresos', path: '/admin/reportes/ingresos' },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <Link to="/admin" onClick={onClose} aria-label="Ir al dashboard">
          <img src={logo} alt="Logo" className="h-8" />
        </Link>
      </div>

      <nav
        className="flex-1 overflow-y-auto p-4 space-y-2"
        aria-label="Menú principal"
      >
        {menuItems.map((item, idx) => (
          <div key={idx}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => handleToggleSubmenu(item.title)}
                  aria-expanded={openSubmenu === item.title}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transform transition-transform ${openSubmenu === item.title ? 'rotate-180' : ''}`}
                  />
                </button>

                {openSubmenu === item.title && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((sub, sidx) => (
                      <Link
                        key={sidx}
                        to={sub.path}
                        onClick={onClose}
                        className="block px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="flex flex-col gap-3">
          {/* Modo oscuro/claro */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tema
            </div>
            <ThemeToggle />
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-3">
            <Avatar />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Carlos Rodríguez
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                admin@hotelapp.com
              </div>
            </div>
          </div>

          {/* Configuración */}
          <Link
            to="/admin/configuracion"
            onClick={onClose}
            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
