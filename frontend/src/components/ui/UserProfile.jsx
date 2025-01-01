import PropTypes from 'prop-types';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserProfile = ({ name, userType, collapsed }) => {
  return (
    <Link
      to="/perfil"
      className={`flex items-center ${
        collapsed ? 'justify-center' : 'gap-4'
      } py-3 px-4 text-black bg-gray-100 rounded-md hover:bg-gray-200 transition-colors`}
    >
      {/* Icono de usuario */}
      <div className="flex-shrink-0">
        <FaUserCircle className="text-2xl text-gray-600" />
      </div>

      {/* Información del usuario (visible solo si no está colapsado) */}
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-bold text-base">{name}</span>
          <span className="text-sm text-gray-500">{userType}</span>
        </div>
      )}
    </Link>
  );
};

UserProfile.propTypes = {
  name: PropTypes.string.isRequired,
  userType: PropTypes.string.isRequired,
  collapsed: PropTypes.bool, // Nueva propiedad
};

UserProfile.defaultProps = {
  collapsed: false, // Valor predeterminado
};

export default UserProfile;
