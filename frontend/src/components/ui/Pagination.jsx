import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full flex justify-center items-center pt-4">
      <ul className="flex gap-2">
        {/* Botón de flecha izquierda */}
        <li>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${
              currentPage === 1
                ? 'bg-secondary-100 text-secondary-600 cursor-not-allowed'
                : 'bg-secondary-300 text-secondary-800 hover:bg-secondary-400 hover:text-secondary-900'
            }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft size={16} />
          </button>
        </li>

        {/* Números de páginas */}
        {getPages().map((page) => (
          <li key={page}>
            <button
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === page
                  ? 'bg-primary-500 text-primary-100'
                  : 'bg-primary-200 text-primary-700 hover:bg-primary-300 hover:text-primary-900'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Botón de flecha derecha */}
        <li>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${
              currentPage === totalPages
                ? 'bg-secondary-100 text-secondary-600 cursor-not-allowed'
                : 'bg-secondary-300 text-secondary-800 hover:bg-secondary-400 hover:text-secondary-900'
            }`}
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            <FaChevronRight size={16} />
          </button>
        </li>
      </ul>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
