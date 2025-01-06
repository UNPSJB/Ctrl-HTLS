import { FaList, FaTh } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { BsCardList } from 'react-icons/bs'; // Icono para la vista compacta
import { useState } from 'react';
import PropTypes from 'prop-types';

const HotelSort = ({ onSortChange, onViewModeChange }) => {
  const [sortOption, setSortOption] = useState('price-asc');

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    onSortChange(value);
  };

  return (
    <div className="flex justify-end items-center w-full space-x-4">
      {/* Selector de Ordenación */}
      <div className="flex items-center">
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          className="p-2 border rounded text-sm"
        >
          <option value="price-asc">
            <IoMdArrowDropdown className="mr-1" />
            Precio: Menor a Mayor
          </option>
          <option value="price-desc">
            <IoMdArrowDropup className="mr-1" />
            Precio: Mayor a Menor
          </option>
          <option value="stars-asc">
            <IoMdArrowDropdown className="mr-1" />
            Estrellas: Menor a Mayor
          </option>
          <option value="stars-desc">
            <IoMdArrowDropup className="mr-1" />
            Estrellas: Mayor a Menor
          </option>
        </select>
      </div>

      {/* Botones de Vista */}
      <div className="flex items-center space-x-2">
        {/* Botón para la vista en lista */}
        <button
          onClick={() => onViewModeChange('list')}
          className="flex items-center p-2 border rounded text-sm"
        >
          <FaList />
        </button>

        {/* Botón para la vista en grid */}
        <button
          onClick={() => onViewModeChange('grid')}
          className="flex items-center p-2 border rounded text-sm"
        >
          <FaTh />
        </button>

        {/* Botón para la vista compacta */}
        <button
          onClick={() => onViewModeChange('compact')}
          className="flex items-center p-2 border rounded text-sm"
        >
          <BsCardList />
        </button>
      </div>
    </div>
  );
};

HotelSort.propTypes = {
  onSortChange: PropTypes.func.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
};

export default HotelSort;
