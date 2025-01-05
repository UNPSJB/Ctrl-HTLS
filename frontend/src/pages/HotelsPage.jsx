import { useState, useEffect } from 'react';
import HotelNameFilter from '@/components/ui/filters/HotelNameFilter';
import HotelList from '@/components/HotelList';
import hotelsData from '../data/hotels.json';
import HotelSort from '@/components/HotelSort';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  useEffect(() => {
    // Cargar hoteles y filtrados
    setHotels(hotelsData);
    setFilteredHotels(hotelsData);

    // Intentar recuperar el modo de vista desde localStorage
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
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

  const handleViewModeChange = (mode) => {
    setViewMode(mode); // Cambiar entre 'list' y 'grid'
    localStorage.setItem('viewMode', mode); // Guardar el modo en localStorage
  };

  return (
    <div className="p-4 space-y-6">
      {/* Filtro */}
      <HotelNameFilter onFilterChange={handleFilterChange} />

      {/* Orden y Vista */}
      <HotelSort
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
      />

      {/* Listado de Hoteles */}
      <HotelList hotels={filteredHotels} viewMode={viewMode} />
    </div>
  );
};

export default HotelsPage;
