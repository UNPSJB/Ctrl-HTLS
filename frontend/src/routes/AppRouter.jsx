import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '@/modules/vendor/layout/MainLayout';
import AdminLayout from '@/modules/admin/layout/AdminLayout';
import HomePage from '@/modules/vendor/pages/HomePage';
import Hoteles from '@/modules/admin/hotels/pages/Hoteles';
import HotelesForm from '@/modules/admin/hotels/pages/HotelesForm';
import Dashboard from '@/modules/admin/dashboard/pages/Dashboard';
import PagoPage from '@/modules/vendor/pages/PagoPage';
import PagoExitoPage from '@/modules/vendor/pages/PagoExitoPage';
import HotelDashboard from '@/modules/admin/hotels/pages/HotelDashboard';
import ScrollToTop from '@/components/ScrollToTop';
import LoginPage from '@/pages/LoginPage';
import ClientesForm from '@/modules/admin/clients/pages/ClientesForm';
import Clientes from '@/modules/admin/clients/pages/Clientes';
import VendedoresForm from '@/modules/admin/vendors/pages/VendedoresForm';
import VendedorLiquidaciones from '@/modules/admin/vendors/pages/VendedorLiquidaciones';
import Administradores from '@/modules/admin/vendors/pages/Administradores';
import Vendedores from '@/modules/admin/vendors/pages/Vendedores';
import AdministradoresForm from '@/modules/admin/vendors/pages/AdministradoresForm';
import Paises from '@/modules/admin/ubicacion/pages/Paises';
import Provincias from '@/modules/admin/ubicacion/pages/Provincias';
import Ciudades from '@/modules/admin/ubicacion/pages/Ciudades';

import Encargados from '@/modules/admin/encargados/pages/Encargados';
import EncargadosForm from '@/modules/admin/encargados/pages/EncargadosForm';
import ClienteHistorial from '@/modules/admin/clients/pages/ClienteHistorial';
import PerfilPage from '@/pages/PerfilPage';

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
                <Route path="pago/exito" element={<PagoExitoPage />} />
                <Route path="perfil" element={<PerfilPage />} />
                <Route path="crear-hotel" element={<HotelesForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}

            {user.rol === 'administrador' && (
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />

                {/* Rutas de Vendedores */}
                <Route path="vendedores" element={<Vendedores />} />
                <Route path="vendedores/nuevo" element={<VendedoresForm />} />
                <Route path="vendedores/editar/:id" element={<VendedoresForm />} />
                <Route path="vendedores/liquidaciones/:id" element={<VendedorLiquidaciones />} />

                {/* Rutas de Administradores */}
                <Route path="administradores" element={<Administradores />} />
                <Route path="administradores/nuevo" element={<AdministradoresForm />} />
                <Route path="administradores/editar/:id" element={<AdministradoresForm />} />

                {/* Rutas de Hoteles */}
                <Route path="hoteles" element={<Hoteles />} />
                <Route path="hoteles/nuevo" element={<HotelesForm />} />
                <Route path="hoteles/:id/dashboard" element={<HotelDashboard />} />

                {/* Rutas de Clientes */}
                <Route path="clientes" element={<Clientes />} />
                <Route path="clientes/nuevo" element={<ClientesForm />} />
                <Route path="clientes/editar/:id" element={<ClientesForm />} />
                <Route path="clientes/:id/historial" element={<ClienteHistorial />} />

                {/* Rutas de Ubicación */}
                <Route path="ubicacion" element={<Navigate to="/admin/ubicacion/paises" replace />} />
                <Route path="ubicacion/paises" element={<Paises />} />
                <Route path="ubicacion/paises/:paisId/provincias" element={<Provincias />} />
                <Route path="ubicacion/paises/:paisId/provincias/:provinciaId/ciudades" element={<Ciudades />} />

                {/* Rutas de Encargados */}
                <Route path="encargados" element={<Encargados />} />
                <Route path="encargados/nuevo" element={<EncargadosForm />} />
                <Route path="encargados/editar/:id" element={<EncargadosForm />} />

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
