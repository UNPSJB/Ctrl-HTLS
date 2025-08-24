// src/layouts/Header.jsx
import { useContext, useState, useMemo } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import Avatar from '@components/ui/Avatar';
import ThemeToggle from '@ui/ThemeToggle';
import CartToggleButton from '@cart/CartToggleButton';
import CartDrawer from '@cart/CartDrawer';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';
import { Link } from 'react-router-dom';
import { useCarrito } from '@context/CarritoContext'; // import del contexto carrito

function Header() {
  const { theme } = useContext(ThemeContext);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Obtener conteo total desde contexto para deshabilitar el toggle si es 0
  const { totalElementos } = useCarrito();

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

  // Manejar apertura/cierre del carrito: solo abrir si hay elementos
  const handleCartToggle = () => {
    if (totalElementos > 0) {
      setIsCartOpen((prev) => !prev);
    } else {
      // Opcional: podrías mostrar un tooltip o toast aquí indicando "No hay reservas"
      // por ahora solo prevenimos la apertura.
    }
  };
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
            {/* Pasamos disabled si no hay elementos */}
            <CartToggleButton
              onClick={handleCartToggle}
              disabled={totalElementos === 0}
            />
            <ThemeToggle />
            <Avatar />
          </div>
        </div>
      </header>

      {/* Carrito lateral */}
      <CartDrawer isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  );
}

export default Header;
