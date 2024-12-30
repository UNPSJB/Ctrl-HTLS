import { useState, useEffect } from 'react';
import HotelFilter from '@/components/ui/filters/HotelFilter';
import HotelList from '@/components/HotelList';
import hotelsData from '../data/hotels.json';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);

  useEffect(() => {
    setHotels(hotelsData);
    setFilteredHotels(hotelsData);
  }, []);

  const handleFilterChange = (filter) => {
    setFilteredHotels(
      hotels.filter((hotel) =>
        hotel.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  return (
    <div className="p-4">
      <HotelFilter onFilterChange={handleFilterChange} />
      <HotelList hotels={filteredHotels} />
    </div>
  );
};

export default HotelsPage;
