import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const SidebarButton = ({ to, icon: Icon, label, onClick, collapsed }) => {
  return to ? (
    <Link
      to={to}
      className={`flex items-center ${
        collapsed ? 'justify-center w-12 h-12' : 'gap-3 py-4 px-4'
      } rounded-md hover:bg-primary-200 transition-colors text-text-800`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {!collapsed && <span>{label}</span>}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className={`flex items-center ${
        collapsed ? 'justify-center w-12 h-12' : 'gap-3 py-4 px-4'
      } rounded-md hover:bg-primary-200 transition-colors text-text-800`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

SidebarButton.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  collapsed: PropTypes.bool,
};

SidebarButton.defaultProps = {
  to: null,
  icon: null,
  onClick: null,
  collapsed: false,
};

export default SidebarButton;
