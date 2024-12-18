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
          <a href="#" className="hover:text-accent-500">
            Aviso Legal
          </a>
          <a href="#" className="hover:text-accent-500">
            Política de Privacidad
          </a>
          <a href="#" className="hover:text-accent-500">
            Términos y Condiciones
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
