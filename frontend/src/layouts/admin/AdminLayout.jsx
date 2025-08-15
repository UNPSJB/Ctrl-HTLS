import { useState } from 'react';
import AdminSidebar from '@layouts/admin/AdminSidebar';
import { Menu } from 'lucide-react';
import VerVendedores from '@/pages/admin/VerVendedores';
import CreateHotelFormPage from '@/pages/CreateHotelFormPage';
import CrearVendedor from '@/pages/admin/CrearVendedor';

function AdminLayout() {
  const [selectedView, setSelectedView] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const viewMap = {
    CrearHotel: <CreateHotelFormPage />,
    VerVendedores: <VerVendedores />,
    CrearVendedor: <CrearVendedor />,
    // VerHoteles: <VerHoteles />,
    // Dashboard: <DashboardHome />,
    // Configuracion: <Configuracion />,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:block
        `}
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
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Panel de administración
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Seleccioná una opción del menú.
              </p>
            </div>
          ) : (
            <div>
              {viewMap[selectedView] || (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
}

export default AdminLayout;
