import { useContext, useMemo } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import Avatar from '@components/ui/Avatar';
import ThemeToggle from '@ui/ThemeToggle';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';
import { Link } from 'react-router-dom';

function Header() {
  const { theme } = useContext(ThemeContext);

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

  return (
    <>
      <header className={`${headerClass} sticky top-0 z-50 p-4`}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo con navegación a inicio */}
          <Link to="/" aria-label="Ir a inicio">
            <img src={logo} alt="Logo" className="w-52" />
          </Link>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Avatar />
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
