import { Outlet } from 'react-router-dom';
import Footer from '@/layouts/Footer';
import ThemeToggle from '@/components/ui/ThemeToggle';

const MainLayout = () => {
  return (
    <>
      {/* Contenedor principal con clases de fondo para modo claro y oscuro */}
      <main className="containerlg:px-10 flex-grow bg-white dark:bg-gray-900">
        <ThemeToggle />
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
