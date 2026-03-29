import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/modules/admin/layout/AdminSidebar';
import Breadcrumbs from '@admin-ui/Breadcrumbs';
import { Outlet } from 'react-router-dom';
import { BreadcrumbProvider } from '@admin-context/BreadcrumbContext';

// Estructura principal para el área de administración
function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BreadcrumbProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <aside
          className={`fixed bottom-0 left-0 top-0 z-40 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out dark:border-gray-700 dark:bg-gray-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block lg:translate-x-0`}
          // Barra lateral (Sidebar)
          style={{ width: '18rem' }}
        >
          <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Área de contenido principal */}
        <main
          className="lg:ml-72 h-screen flex flex-col overflow-hidden transition-all duration-200"
        >
          <div className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col overflow-hidden">
            <div className="flex-shrink-0">
              <Breadcrumbs />
            </div>
            <div className="flex-grow overflow-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <Outlet />
            </div>
          </div>
        </main>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </BreadcrumbProvider>
  );
}

export default AdminLayout;
