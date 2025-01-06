import PropTypes from 'prop-types';
import { FaHotel, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HotelListCard = ({ id, name, stars, price }) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/hoteles/${id}`);
  };

  return (
    <div
      onClick={handleDetailsClick}
      className="grid grid-cols-3 items-center gap-4 bg-primary-100 border border-primary-200 rounded-lg shadow-md p-4 w-full cursor-pointer hover:bg-primary-200 transition-colors duration-200"
    >
      {/* Primera columna: Icono y Nombre */}
      <div className="flex items-center gap-2">
        <FaHotel className="text-primary-700 text-base" />
        <span className="font-semibold text-text-900">{name}</span>
      </div>

      {/* Segunda columna: Número de Estrellas */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: stars }).map((_, index) => (
          <FaStar key={index} className="text-yellow-400" />
        ))}
      </div>

      {/* Tercera columna: Precio */}
      <div className="text-right font-bold text-primary-700">${price}</div>
    </div>
  );
};

HotelListCard.propTypes = {
  id: PropTypes.number.isRequired, // Se agrega id para la navegación
  name: PropTypes.string.isRequired,
  stars: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
};

export default HotelListCard;
