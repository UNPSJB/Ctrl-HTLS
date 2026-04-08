import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import logoLight from '@assets/logo.svg'; // Logo para tema claro
import logoDark from '@assets/logo-dark.svg'; // Logo para tema oscuro

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  // Seleccionamos el logo según el tema actual
  const logo = theme === 'dark' ? logoDark : logoLight;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logo} alt="Logo" className="w-40" />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mejores experiencias hoteleras con ofertas exclusivas y paquetes personalizados.
            </p>
          </div>

          {/* Información de Contacto */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 mb-4">
              Contacto
            </h3>
            <div className="space-y-2 text-sm">
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+1 (234) 567-890</span>
              </a>
              <a
                href="mailto:info@hotelapp.com"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>info@hotelapp.com</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>City, Country</span>
              </div>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 mb-4">
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Términos
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 mb-4">
              Síguenos
            </h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-all hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-pink-100 dark:hover:border-pink-900/30"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-all hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-sky-100 dark:hover:border-sky-900/30"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} HotelApp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
