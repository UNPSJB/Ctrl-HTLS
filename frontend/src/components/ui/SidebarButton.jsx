import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const SidebarButton = ({ to, icon: Icon, label, onClick, collapsed }) => {
  const baseClasses =
    'flex items-center rounded-md transition-colors text-slate-900';
  const sizeClasses = collapsed ? 'justify-center w-12 h-12' : 'gap-4 p-4';
  const colorClasses = collapsed ? 'hover:bg-slate-300' : 'hover:bg-slate-200';

  const combinedClasses = `${baseClasses} ${sizeClasses} ${colorClasses}`;

  return to ? (
    <Link to={to} className={combinedClasses}>
      {Icon && <Icon className="size-5" />}
      {!collapsed && <span>{label}</span>}
    </Link>
  ) : (
    <button onClick={onClick} className={combinedClasses}>
      {Icon && <Icon className="size-5" />}
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
