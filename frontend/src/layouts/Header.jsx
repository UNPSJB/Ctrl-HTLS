import { useContext, useState } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import Avatar from '@/components/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import CartToggleButton from '@/components/ui/CartToggleButton';
import Carrito from '@/components/Carrito';
import logoLight from '../assets/logo.svg';
import logoDark from '../assets/logo-dark.svg';

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const logo = theme === 'dark' ? logoDark : logoLight;

  const headerClass =
    theme === 'dark'
      ? 'bg-gray-800 text-white border-b border-gray-700'
      : 'bg-white text-gray-900 border-b border-gray-200';

  return (
    <>
      <header className={`${headerClass} p-4`}>
        <div className="container mx-auto flex justify-between items-center">
          <img src={logo} alt="Logo" className="w-52" />
          <nav></nav>
          <div className="flex items-center space-x-4">
            <CartToggleButton onClick={toggleCart} />
            <ThemeToggle />
            <Avatar />
          </div>
        </div>
      </header>

      <Carrito isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
