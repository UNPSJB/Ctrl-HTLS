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
    <div className="flex bg-primary-100 border border-primary-200 rounded-lg shadow-md">
      {/* Columna de la imagen */}
      <div className="relative flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="object-cover h-full rounded-l-lg"
        />
        <div className="absolute top-2 right-2 bg-primary-100 flex items-center text-sm font-bold px-2 py-1 rounded">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="text-text-900">{stars}</span>
        </div>
      </div>

      {/* Columna de la información con dos columnas y tres filas */}
      <div className="w-full p-4 flex flex-col justify-between">
        <div className="grid grid-cols-[1fr_auto] grid-rows-3 gap-4 flex-grow">
          {/* Fila 1: Nombre y Precio */}
          <div className="font-semibold text-text-900">{name}</div>
          <div className="font-bold text-primary-700 text-right">${price}</div>

          {/* Fila 2: Dirección y Frase */}
          <div className="text-text-500">{location}</div>
          <div className="text-text-400 italic text-right">{priceLabel}</div>

          {/* Fila 3: Descripción */}
          <div className="text-sm text-text-600">{description}</div>
        </div>

        {/* Botón siempre al fondo */}
        <div className="mt-auto text-right">
          <button
            onClick={handleDetailsClick}
            className="w-auto bg-primary-700 text-accent-100 px-4 py-2 rounded hover:bg-primary-900"
          >
            Ver Detalles
          </button>
        </div>
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
