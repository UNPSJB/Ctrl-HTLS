import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function MainLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Contenedor de scroll que incluye el contenido principal y el footer */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col min-h-full">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
