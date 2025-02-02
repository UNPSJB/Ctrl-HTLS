import PropTypes from 'prop-types';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserProfile = ({ name, userType, collapsed }) => {
  const baseClasses =
    'flex items-center rounded-md transition-colors text-slate-900 bg-slate-200';
  const sizeClasses = collapsed ? 'justify-center size-12' : 'gap-4 p-4';
  const colorClasses = collapsed ? 'hover:bg-slate-300' : 'hover:bg-slate-200';
  const combinedClasses = `${baseClasses} ${sizeClasses} ${colorClasses}`;

  return (
    <Link to="/perfil" className={combinedClasses}>
      <FaUserCircle className="size-5 text-gray-600" />

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
  collapsed: PropTypes.bool,
};

UserProfile.defaultProps = {
  collapsed: false,
};

export default UserProfile;
