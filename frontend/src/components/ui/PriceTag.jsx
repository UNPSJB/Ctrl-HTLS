function PriceTag({ precio = 0, original }) {
  const mostrarOriginal = typeof original === 'number' && original > precio;

  return (
    <>
      {mostrarOriginal ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-md font-bold text-green-600 dark:text-green-400 w-full sm:w-auto">
            ${precio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-through w-full sm:w-auto">
            ${original.toFixed(2)}
          </p>
        </div>
      ) : (
        <p className="text-md font-bold text-gray-800 dark:text-gray-200">
          ${precio.toFixed(2)}
        </p>
      )}
    </>
  );
}

export default PriceTag;
