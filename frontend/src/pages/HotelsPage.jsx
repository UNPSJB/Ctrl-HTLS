import { useState, useEffect } from 'react';
import HotelFilter from '@/components/ui/filters/HotelFilter';
import HotelSort from '@/components/HotelSort';
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

  const handleSortChange = (sortOption) => {
    let sortedHotels = [...filteredHotels];

    switch (sortOption) {
      case 'price-asc':
        sortedHotels = sortedHotels.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedHotels = sortedHotels.sort((a, b) => b.price - a.price);
        break;
      case 'stars-asc':
        sortedHotels = sortedHotels.sort((a, b) => a.stars - b.stars);
        break;
      case 'stars-desc':
        sortedHotels = sortedHotels.sort((a, b) => b.stars - a.stars);
        break;
      default:
        break;
    }

    setFilteredHotels(sortedHotels);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <HotelFilter onFilterChange={handleFilterChange} />
      <HotelSort onSortChange={handleSortChange} />
      <HotelList hotels={filteredHotels} />
    </div>
  );
};

export default HotelsPage;
