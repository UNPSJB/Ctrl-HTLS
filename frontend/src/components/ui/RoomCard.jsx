import { FaWifi, FaTv, FaBath, FaUser } from 'react-icons/fa';
import PropTypes from 'prop-types';

const RoomCard = ({ name, description, capacity, amenities, price, image }) => {
  return (
    <div className="max-w-sm flex flex-col bg-primary-100 border border-primary-200 rounded-lg shadow-md overflow-hidden my-4">
      {/* Imagen */}
      <div className="relative">
        <img src={image} alt={name} className="w-full h-48 object-cover" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col p-4 space-y-4 flex-grow">
        {/* Nombre */}
        <h3 className="text-xl font-semibold text-text-900">{name}</h3>

        {/* Descripción */}
        <p className="text-base text-text-600">{description}</p>

        {/* Capacidad de huéspedes */}
        <div className="flex items-center text-sm text-text-500">
          <FaUser className="text-base mr-2" />
          <span>
            Hasta {capacity} huésped{capacity > 1 ? 'es' : ''}
          </span>
        </div>

        {/* Amenidades */}
        <div className="flex items-center flex-wrap gap-4 text-sm text-text-500">
          {amenities.includes('wifi') && (
            <div className="flex items-center">
              <FaWifi className="text-base mr-2" />
              Wifi
            </div>
          )}
          {amenities.includes('tv') && (
            <div className="flex items-center">
              <FaTv className="text-base mr-2" />
              Televisión
            </div>
          )}
          {amenities.includes('bathroom') && (
            <div className="flex items-center">
              <FaBath className="text-base mr-2" />
              Baño
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-2xl font-bold text-primary-700">${price}</p>
          <span className="text-sm italic text-text-400">por noche</span>
        </div>
      </div>

      {/* Botón */}
      <div className="mt-auto p-4">
        <button className="w-full bg-primary-700 text-accent-100 px-4 py-2 rounded hover:bg-primary-900 text-base">
          Reservar
        </button>
      </div>
    </div>
  );
};

RoomCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  capacity: PropTypes.number.isRequired,
  amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
};

export default RoomCard;
