import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import MainLayout from '@/layouts/MainLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import ReservaPage from '@/pages/ReservaPage';
import CrearHotel from '@/pages/CreateHotelPage';
import HotelFormPage from '@/pages/HotelFormPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/reserva" element={<ReservaPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/crear-hotel" element={<HotelFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
