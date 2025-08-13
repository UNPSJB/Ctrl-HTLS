import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
<<<<<<< HEAD
import NotFoundPage from '@/pages/NotFoundPage';
import ReservaPage from '@/pages/ReservaPage';
=======
import HomePage from '@/pages/HomePage';
import ReservaPage from '@/pages/ReservaPage';
import CreateHotelFormPage from '@/pages/CreateHotelFormPage';
import DashboardPage from '@/pages/DashboardPage';

function AppRouter() {
  const userRole = 'vendedor'; // Esto se debería obtener del estado global o contexto
>>>>>>> origin/features

  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/reserva" element={<ReservaPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
=======
        {/* Layout para vendedor */}
        {userRole === 'vendedor' && (
          <Route path="/" element={<MainLayout variant="vendedor" />}>
            <Route index element={<HomePage />} />
            <Route path="reserva" element={<ReservaPage />} />
            <Route path="crear-hotel" element={<CreateHotelFormPage />} />
          </Route>
        )}

        {/* Layout para admin */}
        {userRole === 'admin' && (
          <Route path="/" element={<MainLayout variant="admin" />}>
            <Route index element={<DashboardPage />} />
          </Route>
        )}
>>>>>>> origin/features
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
