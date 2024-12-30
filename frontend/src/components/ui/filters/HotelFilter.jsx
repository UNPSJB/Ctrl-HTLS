import { useState } from 'react';
import PropTypes from 'prop-types';

const HotelFilter = ({ onFilterChange }) => {
  const [nameFilter, setNameFilter] = useState('');

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNameFilter(value);
    onFilterChange(value);
  };

  return (
    <div>
      <input
        type="text"
        id="hotel-name"
        value={nameFilter}
        onChange={handleNameChange}
        placeholder="Buscar hotel..."
        className="p-2 border rounded w-full"
      />
    </div>
  );
};

HotelFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};

export default HotelFilter;
