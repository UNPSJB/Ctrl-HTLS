import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/modules/admin/layout/AdminLayout';
import HomePage from '@/pages/HomePage';
import Hoteles from '@/modules/admin/hotels/pages/Hoteles';
import HotelesForm from '@/modules/admin/hotels/pages/HotelesForm';
import Dashboard from '@/pages/admin/Dashboard';
import PagoPage from '@/pages/PagoPage';
import HotelPage from '@/pages/HotelPage';
import HotelDashboard from '@/modules/admin/hotels/pages/HotelDashboard';
import ScrollToTop from '@/components/ScrollToTop';
import LoginPage from '@/pages/LoginPage';
import VendedoresList from '@/modules/admin/vendors/components/VendedoresList';
import ClientesForm from '@/modules/admin/clients/pages/ClientesForm';
// Importaremos placeholder o componentes reales según existan
import Clientes from '@/modules/admin/clients/pages/Clientes';
import AdministradoresList from '@/modules/admin/vendors/components/AdministradoresList';
import VendedoresForm from '@/modules/admin/vendors/pages/VendedoresForm';
import LiquidacionesGlobales from '@/modules/admin/vendors/pages/LiquidacionesGlobales';
import VendedorLiquidaciones from '@/modules/admin/vendors/pages/VendedorLiquidaciones';
import Personal from '@/modules/admin/vendors/pages/Personal';
import AdministradoresForm from '@/modules/admin/vendors/pages/AdministradoresForm';

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
                <Route path="crear-hotel" element={<HotelesForm />} />
                <Route path="hotel/:id" element={<HotelPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}

            {user.rol === 'administrador' && (
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />

                {/* Rutas Individuales de Personal (Fuera del Tab Layout) */}
                <Route path="personal/vendedores/nuevo" element={<VendedoresForm />} />
                <Route path="personal/vendedores/editar/:id" element={<VendedoresForm />} />
                <Route path="personal/administradores/nuevo" element={<AdministradoresForm />} />
                <Route path="personal/administradores/editar/:id" element={<AdministradoresForm />} />
                <Route path="personal/liquidaciones" element={<LiquidacionesGlobales />} />
                <Route path="personal/liquidaciones/:id" element={<VendedorLiquidaciones />} />

                {/* Rutas de Personal (Listados con Tabs integrados) */}
                <Route path="personal" element={<Personal />}>
                  <Route index element={<Navigate to="vendedores" replace />} />
                  <Route path="vendedores" element={<VendedoresList />} />
                  <Route path="administradores" element={<AdministradoresList />} />
                </Route>

                {/* Rutas de Hoteles */}
                <Route path="hoteles" element={<Hoteles />} />
                <Route path="hoteles/nuevo" element={<HotelesForm />} />
                <Route path="hoteles/:id/dashboard" element={<HotelDashboard />} />

                {/* Rutas de Clientes */}
                <Route path="clientes" element={<Clientes />} />
                <Route path="clientes/nuevo" element={<ClientesForm />} />
                <Route path="clientes/editar/:id" element={<ClientesForm />} />

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
