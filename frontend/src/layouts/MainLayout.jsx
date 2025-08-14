import { Outlet } from 'react-router-dom';
import Header from '@layouts/Header';
import Footer from '@layouts/Footer';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
