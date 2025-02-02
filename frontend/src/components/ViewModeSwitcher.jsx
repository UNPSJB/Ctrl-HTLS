import PropTypes from 'prop-types';
import { FaList, FaTh } from 'react-icons/fa';
import { BsCardList } from 'react-icons/bs';

const ViewModeSwitcher = ({ currentViewMode, onViewModeChange }) => {
  const buttonClass = 'flex items-center border p-2 rounded';

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onViewModeChange('list')}
        className={`${buttonClass} ${currentViewMode === 'list' ? 'bg-slate-200' : ''}`}
      >
        <FaList className="text-slate-900" />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`${buttonClass} ${currentViewMode === 'grid' ? 'bg-slate-200' : ''}`}
      >
        <FaTh className="text-slate-900" />
      </button>
      <button
        onClick={() => onViewModeChange('compact')}
        className={`${buttonClass} ${currentViewMode === 'compact' ? 'bg-slate-200' : ''}`}
      >
        <BsCardList className="text-slate-900" />
      </button>
    </div>
  );
};

ViewModeSwitcher.propTypes = {
  currentViewMode: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
};

export default ViewModeSwitcher;
