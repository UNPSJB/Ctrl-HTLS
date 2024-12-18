import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">Hoteles App</h1>
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
              to="/about"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-300'
              }
            >
              Sobre Nosotros
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/hotels"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-300'
              }
            >
              Hoteles
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
