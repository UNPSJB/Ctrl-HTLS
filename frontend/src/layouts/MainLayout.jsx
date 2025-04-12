import { Outlet } from 'react-router-dom';
import Footer from '@layouts/Footer';
import Header from '@layouts/Header';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 gap-6">
      <Header />
      {/* Contenedor principal con flex-1 para que ocupe el espacio restante */}
      <main className="flex-1 container mx-auto items-center bg-gray-50 dark:bg-gray-900 px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
