import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <nav className="w-60 h-screen bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Mi App</h1>
        <ul className="space-y-4">
          <li>
            <Link to="/" className="hover:text-gray-300">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-gray-300">
              Acerca de
            </Link>
          </li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <Outlet /> {/* Aquí se renderizarán las páginas */}
      </div>
    </div>
  );
};

export default MainLayout;
