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
import { ThemeContext } from '@/context/ThemeContext';
import logoLight from '../assets/logo.svg'; // Logo para tema claro
import logoDark from '../assets/logo-dark.svg'; // Logo para tema oscuro

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  // Seleccionamos el logo según el tema actual
  const logo = theme === 'dark' ? logoDark : logoLight;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Logo" className="w-52" />
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              Tu destino para encontrar las mejores experiencias hoteleras con
              ofertas exclusivas y paquetes personalizados.
            </p>
          </div>

          {/* Información de Contacto */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Contacto
            </h3>
            <div className="space-y-3">
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Phone className="w-5 h-5" />
                <span>+1 (234) 567-890</span>
              </a>
              <a
                href="mailto:info@hotelapp.com"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Mail className="w-5 h-5" />
                <span>info@hotelapp.com</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>123 Hotel Street, City, Country</span>
              </div>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Síguenos
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} HotelApp. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
