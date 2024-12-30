import { Link } from 'react-router-dom';
import {
  FaHome,
  FaHotel,
  FaEnvelope,
  FaUserCircle,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { useState } from 'react';

const Sidebar = () => {
  const [theme, setTheme] = useState('light'); // Solo para mostrar el cambio de icono

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light'); // Simulación de cambio de tema
  };

  const menuItems = [
    { icon: FaHome, label: 'Inicio', href: '/' },
    { icon: FaHotel, label: 'Hoteles', href: '/hoteles' },
    { icon: FaEnvelope, label: 'Contacto', href: '/contacto' },
  ];

  return (
    <div className="w-64 min-h-screen bg-primary-500 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-primary-700">
        <span className="font-bold text-lg">HotelFinder</span>
      </div>

      {/* Menú de navegación */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-3 p-2 text-base rounded-md hover:bg-primary-700 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Botones al final */}
      <div className="p-4 border-t border-primary-700">
        {/* Botón de tema */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 p-2 text-base rounded-md hover:bg-primary-700 transition-colors"
        >
          {theme === 'light' ? (
            <FaMoon className="h-5 w-5" />
          ) : (
            <FaSun className="h-5 w-5" />
          )}
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>

        {/* Botón de usuario */}
        <Link
          to="/perfil"
          className="w-full flex items-center gap-3 p-2 mt-2 text-base rounded-md hover:bg-primary-700 transition-colors"
        >
          <FaUserCircle className="h-5 w-5" />
          <span>Usuario</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
