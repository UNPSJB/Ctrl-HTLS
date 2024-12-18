import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Primera Parte: Logo */}
        <h1 className="text-lg font-bold">HotelLogo</h1>

        {/* Segunda Parte: Opciones */}
        <ul className="flex space-x-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-300'
              }
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hoteles"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-300'
              }
            >
              Hoteles
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-300'
              }
            >
              Contacto
            </NavLink>
          </li>
        </ul>

        {/* Tercera Parte: Usuario */}
        <div className="flex items-center">
          <span className="cursor-pointer">Usuario</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
