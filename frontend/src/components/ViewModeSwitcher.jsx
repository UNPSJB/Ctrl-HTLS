import PropTypes from 'prop-types';
import { FaList, FaTh } from 'react-icons/fa';
import { BsCardList } from 'react-icons/bs';

const ViewModeSwitcher = ({ currentViewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 border rounded text-sm ${currentViewMode === 'list' ? 'bg-gray-200' : ''}`}
      >
        <FaList />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 border rounded text-sm ${currentViewMode === 'grid' ? 'bg-gray-200' : ''}`}
      >
        <FaTh />
      </button>
      <button
        onClick={() => onViewModeChange('compact')}
        className={`p-2 border rounded text-sm ${currentViewMode === 'compact' ? 'bg-gray-200' : ''}`}
      >
        <BsCardList />
      </button>
    </div>
  );
};

ViewModeSwitcher.propTypes = {
  currentViewMode: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
};

export default ViewModeSwitcher;
