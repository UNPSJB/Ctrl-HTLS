import { Star } from 'lucide-react';

const Calificacion = ({ estrellas }) => {
  // Hacemos la comprobación más robusta.
  // !isNaN(Number(valor)) convierte el valor a número y verifica si NO es "Not a Number".
  // Esto funciona para 4 (número) y "4" (texto).
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
        <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
          {String(estrellas).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default Calificacion;
