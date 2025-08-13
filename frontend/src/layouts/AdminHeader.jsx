import { useContext, useMemo } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import Avatar from '@components/Avatar';
import ThemeToggle from '@ui/ThemeToggle';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';
import { Link } from 'react-router-dom';

function AdminHeader() {
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
    <header className={`${headerClass} p-4 sticky top-0 z-50`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo: lleva al dashboard del admin */}
        <Link to="/admin" aria-label="Ir al panel de administración">
          <img src={logo} alt="Logo" className="w-52" />
        </Link>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Avatar />
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
