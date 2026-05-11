import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  FileText,
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
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo y Descripción */}
          <div className="col-span-1">
            <Link to="/" className="mb-3 flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-40" />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mejores experiencias hoteleras con ofertas exclusivas y paquetes
              personalizados.
            </p>
          </div>

          {/* Información de Contacto */}
          <div className="col-span-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
              Contacto
            </h3>
            <div className="space-y-2 text-sm">
              <a
                href="tel:2804123456"
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <Phone className="h-4 w-4" />
                <span>2804-123456</span>
              </a>
              <a
                href="mailto:info@ctrl-hoteles.com"
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <Mail className="h-4 w-4" />
                <span>info@ctrl-hoteles.com</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>San Martín 987 - Trelew, Chubut</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                <span>CUIT: 30-12345678-9</span>
              </div>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="col-span-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Términos
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div className="col-span-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
              Síguenos
            </h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-transparent bg-gray-50 p-1.5 text-gray-500 transition-all hover:border-blue-100 hover:bg-white hover:text-blue-600 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:border-blue-900/30 dark:hover:bg-gray-700 dark:hover:text-blue-400"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-transparent bg-gray-50 p-1.5 text-gray-500 transition-all hover:border-pink-100 hover:bg-white hover:text-pink-600 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:border-pink-900/30 dark:hover:bg-gray-700 dark:hover:text-pink-400"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-transparent bg-gray-50 p-1.5 text-gray-500 transition-all hover:border-sky-100 hover:bg-white hover:text-sky-500 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:border-sky-900/30 dark:hover:bg-gray-700 dark:hover:text-sky-400"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700/50">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} HotelApp. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
