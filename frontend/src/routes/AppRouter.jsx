// AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import MainLayout from '@/layouts/MainLayout';
import HotelsPage from '@/pages/HotelsPage';
import CreateHotelPage from '@/pages/CreateHotelPage';
import ListHotelsPage from '@/pages/ListHotelsPage';
import HotelPage from '@/pages/HotelPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="hoteles" element={<HotelsPage />} />
          <Route path="hoteles/crear" element={<CreateHotelPage />} />
          <Route path="hoteles/listar" element={<ListHotelsPage />} />
          <Route path="hoteles/:hotelId" element={<HotelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
