import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HotelCardList = ({
  id,
  image,
  stars,
  name,
  price,
  location,
  priceLabel,
  description,
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/hoteles/${id}`);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-primary-100 border border-primary-200 rounded-lg shadow-md">
      {/* Imagen */}
      <div className="w-24 h-24 relative">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-primary-100 flex items-center text-sm font-bold px-2 py-1 rounded">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="text-text-900">{stars}</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow space-y-4">
        <div className="flex justify-between text-sm">
          <div className="font-semibold text-text-900">{name}</div>
          <div className="font-bold text-primary-700">${price}</div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="text-text-500">{location}</div>
          <div className="text-text-400 italic">{priceLabel}</div>
        </div>

        <p className="text-sm text-text-600">{description}</p>
      </div>

      {/* Botón al fondo */}
      <div className="mt-auto p-4 flex justify-end w-full">
        <button
          onClick={handleDetailsClick}
          className="w-auto bg-primary-700 text-accent-100 px-4 py-2 rounded hover:bg-primary-900"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

HotelCardList.propTypes = {
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  stars: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  location: PropTypes.string.isRequired,
  priceLabel: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default HotelCardList;
