import {
  FaHome,
  FaHotel,
  FaEnvelope,
  FaSignOutAlt,
  FaHotel as HotelIcon,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SidebarButton from './ui/SidebarButton';
import UserProfile from './ui/UserProfile';

const Sidebar = () => {
  const menuItems = [
    { icon: FaHome, label: 'Inicio', href: '/' },
    { icon: FaHotel, label: 'Hoteles', href: '/hoteles' },
    { icon: FaEnvelope, label: 'Contacto', href: '/contacto' },
    { icon: FaHotel, label: 'Cargar Hotel', href: '/hoteles/formulario' },
  ];

  // Ejemplo de usuario autenticado
  const user = {
    name: 'Juan Pérez',
    userType: 'Admin',
  };

  return (
    <div className="w-64 min-h-screen flex flex-col border-r">
      {/* Logo */}
      <div className="h-20 flex items-center px-4 border-b text-text-900 border-primary-200">
        <Link to="/" className="flex items-center gap-2">
          <HotelIcon className="text-2xl" />
          <span className="font-bold text-xl">CTRL-HTLS</span>
        </Link>
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
            />
          ))}
        </div>
      </div>

      {/* Botón de cerrar sesión */}
      <div className="flex flex-col gap-2 p-4 border-t border-primary-200">
        <UserProfile name={user.name} userType={user.userType} />
        <SidebarButton to="/salir" icon={FaSignOutAlt} label="Cerrar Sesión" />
      </div>
    </div>
  );
};

export default Sidebar;
