import { useContext, useMemo } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import Avatar from '@components/Avatar';
import ThemeToggle from '@ui/ThemeToggle';
import logoLight from '@assets/logo.svg';
import logoDark from '@assets/logo-dark.svg';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminHeader({ onToggleSidebar }) {
  const { theme } = useContext(ThemeContext);

  const logo = useMemo(
    () => (theme === 'dark' ? logoDark : logoLight),
    [theme]
  );

  const headerClass = useMemo(
    () =>
      theme === 'dark'
        ? 'bg-gray-800 text-white border-b border-gray-700'
        : 'bg-white text-gray-900 border-b border-gray-200',
    [theme]
  );

  return (
    <header className={`${headerClass} h-16 flex items-center`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botón menu para móvil */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>

          <Link to="/admin" aria-label="Ir al dashboard">
            <img src={logo} alt="Logo" className="h-8" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Avatar />
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
