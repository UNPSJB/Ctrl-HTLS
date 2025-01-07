const HotelSearch = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 border p-4 rounded-lg shadow-md">
      {/* Input para ubicación/nombre del hotel */}
      <input
        type="text"
        placeholder="Ubicación o nombre del hotel"
        className="col-span-7 md:col-span-3 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {/* Input para fecha de inicio */}
      <input
        type="date"
        className="col-span-7 md:col-span-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {/* Input para fecha de fin */}
      <input
        type="date"
        className="col-span-7 md:col-span-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {/* Input para cantidad de personas */}
      <input
        type="number"
        min="1"
        placeholder="Personas"
        className="col-span-7 md:col-span-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {/* Botón de búsqueda */}
      <button className="col-span-7 md:col-span-1 px-6 py-2 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-900 transition focus:outline-none focus:ring-2 focus:ring-primary-500 md:self-center">
        Buscar
      </button>
    </div>
  );
};

export default HotelSearch;
