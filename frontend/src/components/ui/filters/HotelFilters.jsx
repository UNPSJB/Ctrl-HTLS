import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

const HotelFilters = ({ onStarFilterChange, onPriceFilterChange }) => {
  const [stars, setStars] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedPriceOption, setSelectedPriceOption] = useState('');

  const handleStarChange = (selectedStars) => {
    setStars(selectedStars);
    onStarFilterChange(selectedStars);
  };

  const handlePriceOptionChange = (option) => {
    setSelectedPriceOption(option);
    let updatedRange;
    if (option === 'low') updatedRange = [0, 100];
    else if (option === 'mid') updatedRange = [100, 300];
    else if (option === 'high') updatedRange = [300, 1000];
    setPriceRange(updatedRange);
    onPriceFilterChange(updatedRange);
  };

  const handlePriceChange = (event, index) => {
    const updatedRange = [...priceRange];
    updatedRange[index] = parseInt(event.target.value, 10);
    setPriceRange(updatedRange);
    setSelectedPriceOption(''); // Clear the predefined options when manual input is used
    onPriceFilterChange(updatedRange);
  };

  return (
    <div className="p-4 rounded-lg border h-full w-full max-w-xs">
      {/* Número de Estrellas */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-secondary-700 mb-4">
          Número de Estrellas
        </label>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleStarChange(star)}
            >
              <input
                type="checkbox"
                checked={stars === star}
                readOnly
                className="hidden"
              />
              <span
                className={`flex items-center space-x-2 text-sm font-medium ${
                  stars === star
                    ? 'text-primary-500 font-bold'
                    : 'text-secondary-700'
                }`}
              >
                <span>Estrellas</span>
                {[...Array(star)].map((_, idx) => (
                  <FaStar key={idx} className="text-yellow-500" />
                ))}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Opciones de Precio */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-secondary-700 mb-4">
          Rango de Precios
        </label>
        <div className="space-y-3 ml-2">
          {['low', 'mid', 'high'].map((option) => (
            <label
              key={option}
              className={`flex items-center space-x-2 cursor-pointer ${
                selectedPriceOption === option
                  ? 'text-primary-500 font-bold'
                  : 'text-secondary-700'
              }`}
              onClick={() => handlePriceOptionChange(option)}
            >
              <input
                type="radio"
                name="price"
                value={option}
                checked={selectedPriceOption === option}
                onChange={() => handlePriceOptionChange(option)}
                className="form-radio text-primary-500"
              />
              <span className="text-sm font-medium">
                {option === 'low' && 'Hasta $100'}
                {option === 'mid' && '$100 a $300'}
                {option === 'high' && 'Más de $300'}
              </span>
            </label>
          ))}
        </div>

        {/* Inputs de rango manual */}
        <div className="flex space-x-2 mt-4">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => handlePriceChange(e, 0)}
            className="w-full p-1 border border-secondary-200 rounded-md bg-accent-100 text-secondary-900"
            placeholder="Mínimo"
          />
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(e, 1)}
            className="w-full p-1 border border-secondary-200 rounded-md bg-accent-100 text-secondary-900"
            placeholder="Máximo"
          />
        </div>
      </div>
    </div>
  );
};

HotelFilters.propTypes = {
  onStarFilterChange: PropTypes.func.isRequired,
  onPriceFilterChange: PropTypes.func.isRequired,
};

export default HotelFilters;
