import PropTypes from 'prop-types';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserProfile = ({ name, userType }) => {
  return (
    <Link
      to="/perfil"
      className="flex items-center gap-4 py-3 px-4 text-black bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
    >
      {/* Columna 1: Icono de usuario */}
      <div className="flex-shrink-0">
        <FaUserCircle className="text-2xl text-gray-600" />{' '}
        {/* Reducción del tamaño */}
      </div>

      {/* Columna 2: Información del usuario */}
      <div className="flex flex-col">
        {/* Nombre del usuario */}
        <span className="font-bold text-base">{name}</span>{' '}
        {/* Tipo de usuario */}
        <span className="text-sm text-gray-500">{userType}</span>
      </div>
    </Link>
  );
};

UserProfile.propTypes = {
  name: PropTypes.string.isRequired,
  userType: PropTypes.string.isRequired,
};

export default UserProfile;
