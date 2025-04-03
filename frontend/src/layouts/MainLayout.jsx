import { Outlet } from 'react-router-dom';
import Footer from '@/layouts/Footer';
import Header from '@/layouts/Header';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 gap-6">
      <Header />
      {/* Contenedor principal con clases de fondo para modo claro y oscuro */}
      <main className="container mx-auto items-center bg-gray-50 dark:bg-gray-900 px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
