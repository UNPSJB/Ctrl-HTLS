import { useState, useEffect } from 'react';
import HotelNameFilter from '@/components/ui/filters/HotelNameFilter';
import HotelFilters from '@/components/ui/filters/HotelFilters';
import HotelSort from '@/components/HotelSort';
import HotelList from '@/components/HotelList';
import hotelsData from '../data/hotels.json';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', o 'compact'

  useEffect(() => {
    setHotels(hotelsData);
    setFilteredHotels(hotelsData);

    // Cargar el modo de vista desde localStorage, si existe
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

  const handleStarFilterChange = (stars) => {
    setFilteredHotels(
      hotels.filter(
        (hotel) =>
          stars === 0 || (hotel.stars >= stars && hotel.stars < stars + 1)
      )
    );
  };

  const handlePriceFilterChange = ([min, max]) => {
    setFilteredHotels(
      hotels.filter((hotel) => hotel.price >= min && hotel.price <= max)
    );
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode); // Cambiar entre 'list', 'grid', y 'compact'
    localStorage.setItem('viewMode', mode); // Guardar el modo en localStorage
  };

  return (
    <div className="p-4 space-y-6">
      {/* Filtro por nombre */}
      <div>
        <HotelNameFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Orden y Vista */}
      <div>
        <HotelSort
          onSortChange={handleSortChange}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Contenedor principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna 1: Filtros */}
        <div className="col-span-12 lg:col-span-3">
          <HotelFilters
            onStarFilterChange={handleStarFilterChange}
            onPriceFilterChange={handlePriceFilterChange}
          />
        </div>

        {/* Columna 2: Listado de Hoteles */}
        <div className="col-span-12 lg:col-span-9">
          <HotelList hotels={filteredHotels} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
