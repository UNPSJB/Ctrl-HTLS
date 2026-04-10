import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { BusquedaProvider } from '@vendor-context/BusquedaContext';
import { CarritoProvider } from '@vendor-context/CarritoContext';
import { ClienteProvider } from '@vendor-context/ClienteContext';


function MainLayout() {
  return (
    <BusquedaProvider>
      <CarritoProvider>
        <ClienteProvider>
          <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Header />

            {/* Contenedor de scroll que incluye el contenido principal y el footer */}
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <div className="flex min-h-full flex-col">
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                  <Outlet />
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </ClienteProvider>
      </CarritoProvider>
    </BusquedaProvider>
  );
}

export default MainLayout;
