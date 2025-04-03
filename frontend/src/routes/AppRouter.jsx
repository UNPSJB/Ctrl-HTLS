import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import MainLayout from '@/layouts/MainLayout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          {/* <Route path="about" element={<AboutPage />} />
          <Route path="hoteles" element={<HotelsPage />} />
          <Route path="hoteles/crear" element={<CreateHotelPage />} />
          <Route path="hoteles/listar" element={<ListHotelsPage />} />
          <Route path="hoteles/:hotelId" element={<HotelPage />} />
          <Route path="hoteles/formulario" element={<HotelFormPage />} />
          <Route path="location" element={<LocationPage />} />
          <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
