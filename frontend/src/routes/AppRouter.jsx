import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import HomePage from '@/pages/HomePage';
import ReservaPage from '@/pages/ReservaPage';
import CreateHotelFormPage from '@/pages/CreateHotelFormPage';
import DashboardPage from '@/pages/DashboardPage';

function AppRouter() {
  const userRole = 'admin'; // Esto debería venir del contexto o autenticación

  return (
    <BrowserRouter>
      <Routes>
        {/* Layout para vendedor */}
        {userRole === 'vendedor' && (
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="reserva" element={<ReservaPage />} />
            <Route path="crear-hotel" element={<CreateHotelFormPage />} />
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
