import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 container mx-auto px-6 lg:px-16 py-8">
          <Outlet /> {/* Aquí se renderizan las rutas hijas */}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
