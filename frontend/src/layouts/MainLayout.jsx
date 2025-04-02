import { Outlet } from 'react-router-dom';
import Footer from '@/layouts/Footer';
import Header from '@/layouts/Header';

const MainLayout = () => {
  return (
    <>
      <Header />
      {/* Contenedor principal con clases de fondo para modo claro y oscuro */}
      <main className="containerlg:px-10 flex-grow bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
