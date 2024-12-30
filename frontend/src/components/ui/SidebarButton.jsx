import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const SidebarButton = ({ to, icon: Icon, label, onClick }) => {
  return to ? (
    <Link
      to={to}
      className="flex items-center gap-3 py-4 px-4 text-base rounded-md hover:bg-primary-200 transition-colors text-text-800"
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </Link>
  ) : (
    <button
      onClick={onClick}
      className="flex items-center gap-3 py-4 px-4 text-base rounded-md hover:bg-primary-200 transition-colors text-text-800"
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </button>
  );
};

SidebarButton.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

SidebarButton.defaultProps = {
  to: null,
  icon: null,
  onClick: null,
};

export default SidebarButton;
