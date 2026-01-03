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

function AdminSidebar({ onSelect = () => {} }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useAuth();

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
      title: 'Gestión de Clientes',
      icon: Users,
      description: 'ABM de clientes',
      submenu: [
        { title: 'Ver Clientes', key: 'VerClientes' },
        { title: 'Crear Cliente', key: 'CrearCliente' },
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
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className={`h-4 w-4 transform text-gray-400 transition-transform ${
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
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
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
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
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
              </button>
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
            <button
              onClick={() => onSelect('Configuracion')}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </button>

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
