import {
  FaHome,
  FaHotel,
  FaEnvelope,
  FaSignOutAlt,
  FaHotel as HotelIcon,
  FaBars,
  FaChevronLeft,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarButton from '../SidebarButton';
import UserProfile from '../UserProfile';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: FaHome, label: 'Inicio', href: '/' },
    { icon: FaHotel, label: 'Hoteles', href: '/hoteles' },
    { icon: FaEnvelope, label: 'Contacto', href: '/contacto' },
    { icon: FaHotel, label: 'Cargar Hotel', href: '/hoteles/formulario' },
    { icon: FaMapMarkedAlt, label: 'Ubicacíon', href: '/location' },
  ];

  const user = {
    name: 'Juan Pérez',
    userType: 'Admin',
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } min-h-screen flex flex-col border-r transition-all duration-300 ease-in-out`}
    >
      {/* Contenedor del logo y botón de minimizar */}
      <div
        className={`h-20 flex items-center border-b text-slate-900 border-slate-200 ${isCollapsed ? 'justify-center' : 'px-4'}`}
      >
        <button
          className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-slate-200 transition-colors text-gray-600"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaBars /> : <FaChevronLeft />}
        </button>
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2 ml-4">
            <HotelIcon className="text-2xl" />
            <span className="font-bold text-xl">Ctrl-Hoteles</span>
          </Link>
        )}
      </div>

      {/* Menú de navegación */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <SidebarButton
              key={item.label}
              to={item.href}
              icon={item.icon}
              label={item.label}
              collapsed={isCollapsed}
            />
          ))}
        </div>
      </div>

      {/* Botón de cerrar sesión */}
      <div
        className={`flex flex-col gap-2 p-4 border-t border-slate-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'items-center' : ''
        }`}
      >
        <UserProfile
          name={user.name}
          userType={user.userType}
          collapsed={isCollapsed}
        />
        <SidebarButton
          to="/salir"
          icon={FaSignOutAlt}
          label="Cerrar Sesión"
          collapsed={isCollapsed}
        />
      </div>
    </div>
  );
};

export default Sidebar;
