import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import { BusquedaProvider } from '@context/BusquedaContext';
import CartSummary from '@cart/CartSummary';

const HomePage = () => {
  return (
    <BusquedaProvider>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <HotelSearch />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <HotelList />
            </div>
            <div className="lg:col-span-2">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </BusquedaProvider>
  );
};

export default HomePage;
