import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '@layouts/admin/AdminSidebar';
import VendedoresLIst from '@ui/admin/list/VendedoresLIst';
import CreateHotelFormPage from '@pages/CreateHotelFormPage';
import CrearVendedor from '@pages/admin/CrearVendedor';
import ClientesList from '@ui/admin/list/ClientesList';

function AdminLayout() {
  const [selectedView, setSelectedView] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const viewMap = {
    CrearHotel: <CreateHotelFormPage />,
    VerVendedores: <VendedoresLIst />,
    CrearVendedor: <CrearVendedor />,
    VerUsuarios: <ClientesList />,
    // VerHoteles: <VerHoteles />,
    // Dashboard: <DashboardHome />,
    // Configuracion: <Configuracion />,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out dark:border-gray-700 dark:bg-gray-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block lg:translate-x-0`}
        style={{ width: '18rem' }}
      >
        <AdminSidebar
          onClose={() => setIsSidebarOpen(false)}
          onSelect={(key) => {
            setSelectedView(key);
            setIsSidebarOpen(false);
          }}
        />
      </aside>

      {/* Main */}
      <main
        className="pt-0 lg:ml-72"
        style={{
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div className="container mx-auto px-4 py-6">
          {!selectedView ? (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Panel de administración
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Seleccioná una opción del menú.
              </p>
            </div>
          ) : (
            <div>
              {viewMap[selectedView] || (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Sección: {selectedView}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Componente no implementado todavía.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Botón para abrir sidebar en móvil */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-6 left-6 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}

export default AdminLayout;
