import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar: altura fija igual a la de la pantalla */}
      <Sidebar className="w-64 h-screen bg-gray-800 text-white" />

      {/* Contenedor principal que incluye el contenido y el footer */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Contenedor que incluye el main y el footer, esta área es la que se desplaza */}
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="container mx-auto px-2 lg:px-10 py-6 flex-grow">
            <Outlet /> {/* Aquí se renderizan las rutas hijas */}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
