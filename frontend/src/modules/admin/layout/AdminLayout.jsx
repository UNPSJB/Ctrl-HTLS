import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/modules/admin/layout/AdminSidebar';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out dark:border-gray-700 dark:bg-gray-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block lg:translate-x-0`}
        style={{ width: '18rem' }}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main
        className="pt-0 lg:ml-72"
        style={{
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs />
          <Outlet />
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
  );
}

export default AdminLayout;
