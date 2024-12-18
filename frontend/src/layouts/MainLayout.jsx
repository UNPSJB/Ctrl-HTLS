import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal */}
      <main className="flex-1 container mx-auto px-6 lg:px-16 py-8">
        <Outlet /> {/* Aquí se renderizan las rutas hijas */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
