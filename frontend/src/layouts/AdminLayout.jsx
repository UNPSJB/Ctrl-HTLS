import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AdminSidebar from '@layouts/AdminSidebar';
import { Menu } from 'lucide-react';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:block
        `}
        style={{ width: '18rem' }} // ancho fijo: 18rem == w-72
        aria-hidden={
          !isSidebarOpen &&
          typeof window !== 'undefined' &&
          window.innerWidth < 1024
        }
      >
        {/* AdminSidebar debe ser solo contenido (sin fixed). onClose cierra en móvil. */}
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main content: empujado a la derecha en desktop y full-width en mobile */}
      <main
        className="pt-0 lg:ml-72"
        style={{
          height: '100vh', // toda la ventana; el scroll queda dentro de main
          overflowY: 'auto',
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Botón flotante para abrir sidebar en móvil */}
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
