import { useState, useContext, useMemo } from 'react';
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
import Avatar from '@components/ui/Avatar';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';

function AdminSidebar({ onSelect = () => {} }) {
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
      description: 'Vista general',
      key: 'Dashboard',
    },
    {
      title: 'Gestión de Hoteles',
      icon: Building2,
      description: 'ABM de hoteles',
      submenu: [
        { title: 'Ver Hoteles', key: 'VerHoteles' },
        { title: 'Crear Hotel', key: 'CrearHotel' },
        { title: 'Categorías', key: 'CategoriasHotel' },
      ],
    },
    {
      title: 'Gestión de Vendedores',
      icon: UserCheck,
      description: 'ABM de vendedores',
      submenu: [
        { title: 'Ver Vendedores', key: 'VerVendedores' },
        { title: 'Crear Vendedor', key: 'CrearVendedor' },
      ],
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      description: 'ABM de usuarios',
      submenu: [
        { title: 'Ver Usuarios', key: 'VerUsuarios' },
        { title: 'Crear Usuario', key: 'CrearUsuario' },
      ],
    },
    {
      title: 'Reportes',
      icon: BarChart3,
      description: 'Estadísticas',
      submenu: [
        { title: 'Reservas', key: 'ReporteReservas' },
        { title: 'Ingresos', key: 'ReporteIngresos' },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-8" />
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
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
                    className={`w-4 h-4 text-gray-400 transform transition-transform ${
                      openSubmenu === item.title ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openSubmenu === item.title && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((sub, sidx) => (
                      <button
                        key={sidx}
                        onClick={() => onSelect(sub.key)}
                        className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        {sub.title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => onSelect(item.key)}
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
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Footer con Theme y Avatar */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tema
            </div>
            <ThemeToggle />
          </div>

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

          <button
            onClick={() => onSelect('Configuracion')}
            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
