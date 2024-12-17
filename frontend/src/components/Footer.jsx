const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 text-center">
      <div className="container mx-auto">
        <p>
          © {new Date().getFullYear()} Mi Aplicación. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
