import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import Avatar from '@/components/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import logoLight from '../assets/logo.svg'; // Logo para tema claro
import logoDark from '../assets/logo-dark.svg'; // Logo para tema oscuro

const Header = () => {
  const { theme } = useContext(ThemeContext);

  // Seleccionamos el logo según el tema actual
  const logo = theme === 'dark' ? logoDark : logoLight;

  // Definimos las clases según el tema
  const headerClass =
    theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900';

  return (
    <header className={`${headerClass} p-4`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Renderizamos el logo correspondiente */}
        <img src={logo} alt="Logo" className="w-40" />
        <nav></nav>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Avatar />
        </div>
      </div>
    </header>
  );
};

export default Header;
