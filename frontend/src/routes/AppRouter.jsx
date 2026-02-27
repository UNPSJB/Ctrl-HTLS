import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/modules/admin/layout/AdminLayout';
import HomePage from '@/pages/HomePage';
import HotelFormPage from '@/modules/admin/hotels/pages/HotelFormPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import PagoPage from '@/pages/PagoPage';
import HotelPage from '@/pages/HotelPage';
import ScrollToTop from '@/components/ScrollToTop';
import LoginPage from '@/pages/LoginPage';
import VendedoresList from '@/modules/admin/vendors/components/VendedoresList';
import VendedorFormPage from '@/modules/admin/vendors/pages/VendedorFormPage';
import LiquidacionesGlobalesPage from '@/modules/admin/vendors/pages/LiquidacionesGlobalesPage';
import AdministradoresList from '@/modules/admin/vendors/components/AdministradoresList';
import VendedorLiquidacionesPage from '@/modules/admin/vendors/pages/VendedorLiquidacionesPage';
import PersonalManager from '@/modules/admin/vendors/pages/PersonalManager';
import AdminFormPage from '@/modules/admin/vendors/pages/AdminFormPage';
import ClienteFormPage from '@/modules/admin/clients/pages/ClienteFormPage';
// Importaremos placeholder o componentes reales según existan
import ClientesManager from '@/modules/admin/clients/components/ClientesManager';
import AdminHotelList from '@/modules/admin/hotels/components/AdminHotelList';

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
                <Route path="crear-hotel" element={<HotelFormPage />} />
                <Route path="hotel/:id" element={<HotelPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}

            {user.rol === 'administrador' && (
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />

                {/* Rutas de Personal (Vendedores + Administradores) */}
                <Route path="personal" element={<PersonalManager />}>
                  <Route index element={<Navigate to="vendedores" replace />} />
                  <Route path="vendedores" element={<VendedoresList />} />
                  <Route path="administradores" element={<AdministradoresList />} />
                </Route>
                <Route path="vendedores/nuevo" element={<VendedorFormPage />} />
                <Route path="vendedores/editar/:id" element={<VendedorFormPage />} />
                <Route path="administradores/nuevo" element={<AdminFormPage />} />
                <Route path="administradores/editar/:id" element={<AdminFormPage />} />
                <Route path="personal/liquidaciones" element={<LiquidacionesGlobalesPage />} />
                <Route path="personal/liquidaciones/:id" element={<VendedorLiquidacionesPage />} />

                {/* Rutas de Hoteles */}
                <Route path="hoteles" element={<AdminHotelList />} />
                <Route path="hoteles/nuevo" element={<HotelFormPage />} />
                <Route path="hoteles/editar/:id" element={<HotelFormPage />} />

                {/* Rutas de Clientes */}
                <Route path="clientes" element={<ClientesManager />} />
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
