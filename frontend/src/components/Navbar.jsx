import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">Mi App</h1>

        {/* Enlaces de navegación */}
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:text-gray-300">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-gray-300">
              Acerca de
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
