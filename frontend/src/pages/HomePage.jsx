import HotelList from '@/components/HotelList';
import HotelSearch from '@/components/HotelSearch';

const HomePage = () => {
  return (
    <div className="container flex flex-col gap-6">
      <HotelSearch />
      <HotelList />
    </div>
  );
};

export default HomePage;
