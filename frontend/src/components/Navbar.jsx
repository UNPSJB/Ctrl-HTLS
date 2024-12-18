import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-primary text-white p-4 flex items-center justify-between">
      {/* Primera Parte: Logo */}
      <div className="flex items-center">
        <span className="font-bold text-xl">HotelLogo</span>
      </div>

      {/* Segunda Parte: Opciones */}
      <div className="flex space-x-4">
        <Link to="/" className="hover:text-accent">
          Inicio
        </Link>
        <Link to="/hoteles" className="hover:text-accent">
          Hoteles
        </Link>
        <Link to="/contacto" className="hover:text-accent">
          Contacto
        </Link>
      </div>

      {/* Tercera Parte: Usuario */}
      <div className="flex items-center">
        <span className="cursor-pointer hover:text-accent">Usuario</span>
      </div>
    </nav>
  );
};

export default Navbar;
