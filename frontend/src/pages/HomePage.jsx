import { useState, useEffect } from 'react';
import HotelList from '@/components/HotelList';
import HotelSearch from '@/components/ui/filters/HotelSearch';
import hotelsData from '../data/hotels.json';

const HomePage = () => {
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', o 'compact'

  useEffect(() => {
    setFilteredHotels(hotelsData);

    // Cargar el modo de vista desde localStorage, si existe
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col gap-6">
      <HotelSearch />

      {/* test de visualizacion de hoteles */}
      <HotelList hotels={filteredHotels} viewMode={viewMode} />
    </div>
  );
};

export default HomePage;
