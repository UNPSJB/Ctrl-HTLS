import { Outlet } from 'react-router-dom';
import Footer from '@/layouts/Footer';

const MainLayout = () => {
  return (
    <>
      <main className="container mx-auto px-2 lg:px-10 py-6 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
