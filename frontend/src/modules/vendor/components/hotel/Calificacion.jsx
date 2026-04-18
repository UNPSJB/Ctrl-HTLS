import { Star } from 'lucide-react';

const Calificacion = ({ estrellas }) => {

  const isNumericRating = !isNaN(Number(estrellas));

  return (
    <div
      role={isNumericRating ? 'img' : 'status'}
      aria-label={
        isNumericRating ? `${estrellas} estrellas` : `Categoría ${estrellas}`
      }
      className="flex items-center gap-1"
    >
      {isNumericRating ? (
        <>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {estrellas}
          </span>
          <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
        </>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-700 dark:text-gray-300 leading-none">
            {String(estrellas).toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize flex items-center">
            (Hospedaje)
          </span>
        </div>
      )}
    </div>
  );
};

export default Calificacion;
