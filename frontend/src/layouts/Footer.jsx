import { FaGavel, FaLock, FaFileContract } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary-700 text-white py-6">
      <div className="container mx-auto text-center space-y-2">
        {/* Derechos Reservados */}
        <p className="text-sm">
          © {new Date().getFullYear()} HotelApp. Todos los derechos reservados.
        </p>

        {/* Enlaces Adicionales */}
        <div className="flex justify-center space-x-6 text-accent-100">
          <a
            href="#"
            className="flex items-center space-x-2 hover:text-accent-500"
          >
            <FaGavel size={16} />
            <span>Aviso Legal</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 hover:text-accent-500"
          >
            <FaLock size={16} />
            <span>Política de Privacidad</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 hover:text-accent-500"
          >
            <FaFileContract size={16} />
            <span>Términos y Condiciones</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
