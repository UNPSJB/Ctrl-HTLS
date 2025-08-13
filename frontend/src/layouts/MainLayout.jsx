import { Outlet } from 'react-router-dom';
import Footer from '@layouts/Footer';
import Header from '@layouts/Header';
import AdminHeader from '@layouts/AdminHeader';
import AdminSidebar from '@layouts/AdminSidebar';

function MainLayout({ variant = 'seller' }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header dinámico */}
      {variant === 'admin' ? <AdminHeader /> : <Header />}

      {/* Contenido con sidebar y main */}
      <div className="flex flex-1">
        {variant === 'admin' && <AdminSidebar />}
        <main className="flex-1 container mx-auto px-6 py-4">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;
