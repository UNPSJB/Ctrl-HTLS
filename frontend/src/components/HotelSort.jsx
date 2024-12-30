import { useState } from 'react';
import PropTypes from 'prop-types';

const HotelSort = ({ onSortChange }) => {
  const [sortOption, setSortOption] = useState('price-asc'); // valor por defecto

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    onSortChange(value);
  };

  return (
    <div className="mt-auto flex justify-end">
      <select
        id="sort"
        value={sortOption}
        onChange={handleSortChange}
        className="p-2 border rounded"
      >
        <option value="price-asc">Precio: Menor a Mayor</option>
        <option value="price-desc">Precio: Mayor a Menor</option>
        <option value="stars-asc">Estrellas: Menor a Mayor</option>
        <option value="stars-desc">Estrellas: Mayor a Menor</option>
      </select>
    </div>
  );
};

HotelSort.propTypes = {
  onSortChange: PropTypes.func.isRequired,
};

export default HotelSort;
