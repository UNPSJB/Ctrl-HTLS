import { useState, useEffect } from 'react';
import HotelNameFilter from '@/components/ui/filters/HotelNameFilter';
import HotelFilters from '@/components/ui/filters/HotelFilters';
import HotelSort from '@/components/HotelSort';
import HotelList from '@/components/HotelList';
import hotelsData from '../data/hotels.json';
import useViewMode from '@/hooks/useViewMode';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [viewMode, setViewMode] = useViewMode('grid');

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
    setFilteredHotels(
      [...filteredHotels].sort((a, b) => {
        switch (sortOption) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'stars-asc':
            return a.stars - b.stars;
          case 'stars-desc':
            return b.stars - a.stars;
          default:
            return 0;
        }
      })
    );
  };

  return (
    <div className="p-4 space-y-6">
      <HotelNameFilter onFilterChange={handleFilterChange} />
      <HotelSort
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        currentViewMode={viewMode}
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <HotelFilters />
        </div>
        <div className="col-span-12 lg:col-span-9">
          <HotelList hotels={filteredHotels} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
