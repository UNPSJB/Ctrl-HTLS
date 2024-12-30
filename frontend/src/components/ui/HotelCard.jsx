import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HotelCard = ({
  id,
  image,
  stars,
  name,
  price,
  location,
  priceLabel,
  description,
  viewMode, // Prop que indica el modo de vista
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/hoteles/${id}`);
  };

  return (
    <div
      className={`${
        viewMode === 'list'
          ? 'flex items-center space-x-4' // En modo lista se aplica espacio entre los elementos
          : 'max-w-sm flex flex-col' // En modo grid
      } h-full bg-primary-100 border border-primary-200 rounded-lg shadow-md overflow-hidden`}
    >
      {/* Contenedor de la imagen y las estrellas (sin padding/margin) */}
      <div
        className={`${
          viewMode === 'list' ? 'flex-shrink-0 w-32 h-48' : 'w-full h-48'
        } relative`}
      >
        <img
          src={image}
          alt={name}
          className={`${
            viewMode === 'list' ? 'object-cover w-full h-full' : 'object-cover'
          }`}
        />
        <div className="absolute top-2 right-2 bg-primary-100 flex items-center text-sm font-bold px-2 py-1 rounded">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="text-text-900">{stars}</span>
        </div>
      </div>

      {/* Contenedor con la información (nombre, precio, etc.) */}
      <div
        className={`${
          viewMode === 'list'
            ? 'flex flex-col flex-grow space-y-4 p-4' // En modo lista se aplica padding y espacio entre los elementos
            : 'flex flex-col space-y-6 flex-grow p-4' // En modo grid se aplica padding y espacio entre los elementos
        }`}
      >
        {/* Modo Lista */}
        {viewMode === 'list' ? (
          <>
            {/* Nombre y Precio */}
            <div className="flex justify-between text-sm">
              <div className="font-semibold text-text-900">{name}</div>
              <div className="font-bold text-primary-700">${price}</div>
            </div>

            {/* Dirección y frase (precio por noche) */}
            <div className="flex justify-between text-sm">
              <div className="text-text-500">{location}</div>
              <div className="text-text-400 italic">{priceLabel}</div>
            </div>

            {/* Descripción */}
            <p className="text-sm text-text-600">{description}</p>

            {/* Botón al fondo */}
            <div className="mt-auto p-4 flex justify-end w-full">
              <button
                onClick={handleDetailsClick}
                className="w-auto bg-primary-700 text-accent-100 px-4 py-2 rounded hover:bg-primary-900"
              >
                Ver Detalles
              </button>
            </div>
          </>
        ) : (
          /* Modo Cuadrícula */
          <>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-left font-semibold text-text-900">
                {name}
              </div>
              <div className="text-right font-bold text-primary-700">
                ${price}
              </div>

              <div className="text-left text-text-500">{location}</div>
              <div className="text-right italic text-text-400">
                {priceLabel}
              </div>
            </div>

            <p className="text-sm text-text-600">{description}</p>

            {/* Botón siempre al fondo */}
            <div className="mt-auto p-4">
              <button
                onClick={handleDetailsClick}
                className="w-full bg-primary-700 text-accent-100 px-4 py-2 rounded hover:bg-primary-900"
              >
                Ver Detalles
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

HotelCard.propTypes = {
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  stars: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  location: PropTypes.string.isRequired,
  priceLabel: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired, // Añadimos la prop `viewMode`
};

export default HotelCard;
