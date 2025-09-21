import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/admin/AdminLayout';
import HomePage from '@/pages/HomePage';
import ReservaPage from '@/pages/ReservaPage';
import CreateHotelFormPage from '@/pages/CreateHotelFormPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import PagoPage from '@/pages/PagoPage';
import HotelPage from '@/pages/HotelPage';

function AppRouter() {
  const userRole = 'vendedor'; // Esto debería venir del contexto o autenticación

  return (
    <BrowserRouter>
      <Routes>
        {/* Layout para vendedor */}
        {userRole === 'vendedor' && (
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="reserva" element={<ReservaPage />} />
            <Route path="pago" element={<PagoPage />} />
            <Route path="crear-hotel" element={<CreateHotelFormPage />} />
            <Route path="hotel/:id" element={<HotelPage />} />
          </Route>
        )}

        {/* Layout para admin */}
        {userRole === 'admin' && (
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
