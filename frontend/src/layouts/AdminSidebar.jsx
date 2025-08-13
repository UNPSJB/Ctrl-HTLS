import { useState } from 'react';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';

function AdminSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
      description: 'Vista general del sistema',
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
        { title: 'Asignar Hoteles', path: '/admin/vendedores/asignar' },
      ],
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      path: '/admin/usuarios',
      description: 'ABM de usuarios del sistema',
      submenu: [
        { title: 'Ver Usuarios', path: '/admin/usuarios' },
        { title: 'Crear Usuario', path: '/admin/usuarios/crear' },
        { title: 'Roles y Permisos', path: '/admin/usuarios/roles' },
      ],
    },
    {
      title: 'Reportes',
      icon: BarChart3,
      path: '/admin/reportes',
      description: 'Estadísticas y reportes',
      submenu: [
        { title: 'Reservas', path: '/admin/reportes/reservas' },
        { title: 'Ingresos', path: '/admin/reportes/ingresos' },
        { title: 'Ocupación', path: '/admin/reportes/ocupacion' },
      ],
    },
    {
      title: 'Configuración',
      icon: Settings,
      path: '/admin/configuracion',
      description: 'Configuración del sistema',
    },
  ];

  return (
    <>
      {/* Sidebar Menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out 
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={index}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group">
                    <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    {item.submenu && (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Submenu (a futuro puede tener toggle propio) */}
                  {item.submenu && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subitem, subindex) => (
                        <button
                          key={subindex}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                        >
                          {subitem.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}

export default AdminSidebar;
