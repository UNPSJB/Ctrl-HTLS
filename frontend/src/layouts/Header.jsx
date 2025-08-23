import { useContext, useState, useMemo } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import Avatar from '@components/ui/Avatar';
import ThemeToggle from '@ui/ThemeToggle';
import CartToggleButton from '@cart/CartToggleButton';
import Carrito from '@cart/Carrito';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Elegir logo según el tema
  const logo = useMemo(
    () => (theme === 'dark' ? logoDark : logoLight),
    [theme]
  );

  // Clases dinámicas para el header
  const headerClass = useMemo(
    () =>
      theme === 'dark'
        ? 'bg-gray-800 text-white border-b border-gray-700'
        : 'bg-white text-gray-900 border-b border-gray-200',
    [theme]
  );

  // Manejar apertura/cierre del carrito
  const handleCartToggle = () => setIsCartOpen((prev) => !prev);
  const handleCartClose = () => setIsCartOpen(false);

  return (
    <>
      <header className={`${headerClass} p-4 sticky top-0 z-50`}>
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo con navegación a inicio */}
          <Link to="/" aria-label="Ir a inicio">
            <img src={logo} alt="Logo" className="w-52" />
          </Link>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            <CartToggleButton onClick={handleCartToggle} />
            <ThemeToggle />
            <Avatar />
          </div>
        </div>
      </header>

      {/* Carrito lateral */}
      <Carrito isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  );
};

export default Header;
