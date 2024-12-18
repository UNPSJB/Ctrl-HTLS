import { Link } from 'react-router-dom';

const Navbar = () => {
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
        <ul className="hidden md:flex space-x-8 font-medium">
          <li>
            <Link to="/" className="hover:text-accent-500">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/hoteles" className="hover:text-accent-500">
              Hoteles
            </Link>
          </li>
          <li>
            <Link to="/contacto" className="hover:text-accent-500">
              Contacto
            </Link>
          </li>
        </ul>

        {/* Usuario */}
        <div className="hidden md:block">
          <Link to="/perfil" className="hover:text-accent-500">
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
