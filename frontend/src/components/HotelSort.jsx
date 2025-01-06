import PropTypes from 'prop-types';
import ViewModeSwitcher from './ViewModeSwitcher';
import { useState } from 'react';

const HotelSort = ({ onSortChange, onViewModeChange, currentViewMode }) => {
  const [sortOption, setSortOption] = useState('price-asc');

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    onSortChange(value);
  };

  return (
    <div className="flex justify-end items-center w-full gap-2">
      {/* Selector de Ordenación */}
      <div>
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          className="p-2 border rounded text-sm"
        >
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="stars-asc">Estrellas: Menor a Mayor</option>
          <option value="stars-desc">Estrellas: Mayor a Menor</option>
        </select>
      </div>

      {/* Cambiador de Modo de Vista */}
      <ViewModeSwitcher
        currentViewMode={currentViewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
};

HotelSort.propTypes = {
  onSortChange: PropTypes.func.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  currentViewMode: PropTypes.string.isRequired,
};

export default HotelSort;
