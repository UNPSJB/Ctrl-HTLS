import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/admin/AdminLayout';
import HomePage from '@/pages/HomePage';
import CreateHotelFormPage from '@/pages/CreateHotelFormPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import PagoPage from '@/pages/PagoPage';
import HotelPage from '@/pages/HotelPage';
import ScrollToTop from '@/components/ScrollToTop';
import LoginPage from '@/pages/LoginPage';
import VendedoresList from '@/components/ui/admin/list/VendedoresLIst';
import VendedorFormPage from '@/pages/admin/VendedorFormPage';
import ClienteFormPage from '@/pages/admin/ClienteFormPage';
// Importaremos placeholder o componentes reales según existan
import ClientesList from '@/components/ui/admin/list/ClientesList';
import AdminHotelList from '@/components/ui/admin/list/AdminHotelList';

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {!user ? (
          <Route path="*" element={<LoginPage />} />
        ) : (
          <>
            {user.rol === 'vendedor' && (
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="pago" element={<PagoPage />} />
                <Route path="crear-hotel" element={<CreateHotelFormPage />} />
                <Route path="hotel/:id" element={<HotelPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}

            {user.rol === 'administrador' && (
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />

                {/* Rutas de Vendedores */}
                <Route path="vendedores" element={<VendedoresList />} />
                <Route path="vendedores/nuevo" element={<VendedorFormPage />} />
                <Route path="vendedores/editar/:id" element={<VendedorFormPage />} />

                {/* Rutas de Hoteles */}
                <Route path="hoteles" element={<AdminHotelList />} />
                <Route path="hoteles/nuevo" element={<CreateHotelFormPage />} />

                {/* Rutas de Clientes */}
                <Route path="clientes" element={<ClientesList />} />
                <Route path="clientes/nuevo" element={<ClienteFormPage />} />
                <Route path="clientes/editar/:id" element={<ClienteFormPage />} />

                {/* Fallback admin */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            )}

            {/* Redirección para admins que entran a la raíz */}
            {user.rol === 'administrador' && (
              <Route path="/" element={<Navigate to="/admin" replace />} />
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
