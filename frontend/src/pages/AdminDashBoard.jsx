'use client';

import { useState } from 'react';
import {
  Menu,
  X,
  Home,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Datos mock del usuario administrador
  const adminUser = {
    nombre: 'Carlos Rodríguez',
    email: 'admin@hotelapp.com',
    rol: 'Administrador',
    avatar: '/placeholder.svg?height=40&width=40',
  };

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo y Menú Hamburguesa */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Abrir menú"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Hotel Admin
                </h1>
              </div>
            </div>

            {/* Acciones del Header */}
            <div className="flex items-center gap-3">
              {/* Toggle Dark Mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Cambiar tema"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notificaciones */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Perfil de Usuario */}
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <img
                    src={adminUser.avatar || '/placeholder.svg'}
                    alt={adminUser.nombre}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {adminUser.nombre}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown del Perfil */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={adminUser.avatar || '/placeholder.svg'}
                          alt={adminUser.nombre}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {adminUser.nombre}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {adminUser.email}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mt-1">
                            {adminUser.rol}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Mi Perfil
                        </span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Configuración
                        </span>
                      </button>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Menu */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-0`}
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

                      {/* Submenu (por ahora oculto, se puede expandir con estado) */}
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
              onClick={toggleMenu}
            ></div>
          )}

          {/* Contenido Principal */}
          <main className="flex-1 lg:ml-0">
            <div className="p-6">
              {/* Bienvenida */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Bienvenido, {adminUser.nombre}!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Panel de administración del sistema de hoteles
                </p>
              </div>

              {/* Cards de Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Hoteles
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        24
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    +2 este mes
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Vendedores Activos
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        12
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    +1 esta semana
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Usuarios Registrados
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        1,247
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    +45 esta semana
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Reservas Hoy
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        89
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                      <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    +12% vs ayer
                  </p>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Crear Hotel
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Agregar nuevo hotel
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Crear Vendedor
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Agregar nuevo vendedor
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Ver Reportes
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estadísticas del sistema
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
