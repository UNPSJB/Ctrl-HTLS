import PropTypes from 'prop-types';
import { FaEnvelope, FaPhone, FaHotel } from 'react-icons/fa'; // Importamos los iconos

const ManagerCard = ({ name, email, phone, hotels, image }) => {
  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full">
      {/* Columna de imagen */}
      <div className="flex justify-start">
        <img src={image} alt={name} className="w-40 h-40 object-cover" />
      </div>

      {/* Columna de datos */}
      <div className="flex flex-col justify-start px-4 py-2 gap-2">
        {/* Fila 1: Nombre */}
        <h3 className="text-3xl font-bold text-primary-700">{name}</h3>

        {/* Fila 2: Información de contacto */}
        <div className="flex flex-col justify-start gap-3">
          <p className="text-body-md text-text-500 flex items-center">
            <FaEnvelope className="mr-2" /> {email}
          </p>
          <p className="text-body-md text-text-500 flex items-center">
            <FaPhone className="mr-2" /> {phone}
          </p>
          <div className="text-body-md text-text-500 flex items-center">
            <FaHotel className="mr-2" />
            {hotels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hotels.map((hotel, index) => (
                  <span
                    key={index}
                    className="bg-accent-200 text-accent-700 px-2 rounded-full text-sm"
                  >
                    {hotel}
                  </span>
                ))}
              </div>
            ) : (
              <p>No tiene hoteles asignados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ManagerCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  hotels: PropTypes.array.isRequired,
  start_date: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default ManagerCard;
