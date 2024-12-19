import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const [isHotelsDropdownOpen, setIsHotelsDropdownOpen] = useState(false);

  const toggleHotelsDropdown = () => {
    setIsHotelsDropdownOpen(!isHotelsDropdownOpen);
  };

  const menuItems = [
    { to: '/', label: 'Inicio' },
    { to: '/contacto', label: 'Contacto' },
  ];

  return (
    <nav className="bg-primary-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-2xl">
          <Link to="/" aria-label="Logo del Hotel">
            HotelLogo
          </Link>
        </div>

        {/* Menú de navegación */}
        <ul
          className="hidden md:flex space-x-8 font-medium"
          aria-label="Menú de navegación"
        >
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.to} className="hover:text-accent-500">
                {item.label}
              </Link>
            </li>
          ))}

          {/* Dropdown para Hoteles */}
          <li className="relative">
            <button
              onClick={toggleHotelsDropdown}
              className="hover:text-accent-500 flex items-center"
              aria-expanded={isHotelsDropdownOpen}
              aria-haspopup="true"
            >
              Hoteles
            </button>
            {isHotelsDropdownOpen && (
              <ul className="absolute top-full left-0 bg-white text-black mt-2 py-2 rounded shadow-lg w-48 z-10">
                <li>
                  <Link
                    to="/hoteles/crear"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Crear Hotel
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hoteles/listar"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Listar Hoteles
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>

        {/* Usuario */}
        <div className="hidden md:block">
          <Link
            to="/perfil"
            className="hover:text-accent-500 flex items-center"
          >
            <FaUserCircle className="mr-2" />
            Usuario
          </Link>
        </div>

        {/* Menú móvil */}
        <div className="md:hidden">
          <button className="hover:text-accent-500">☰</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
