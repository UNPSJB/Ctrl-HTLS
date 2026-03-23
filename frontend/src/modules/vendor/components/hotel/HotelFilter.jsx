function HotelFilter({ estrellasSeleccionadas, setEstrellasSeleccionadas }) {
  const estrellas = [1, 2, 3, 4, 5];

  const toggleEstrella = (estrella) => {
    if (estrellasSeleccionadas.includes(estrella)) {
      setEstrellasSeleccionadas(
        estrellasSeleccionadas.filter((e) => e !== estrella)
      );
    } else {
      setEstrellasSeleccionadas([...estrellasSeleccionadas, estrella]);
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="flex flex-wrap gap-3">
        {estrellas.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => toggleEstrella(e)}
            className={`flex items-center justify-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 ${
              estrellasSeleccionadas.includes(e)
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {e} ⭐
          </button>
        ))}
      </div>
    </div>
  );
}

export default HotelFilter;
