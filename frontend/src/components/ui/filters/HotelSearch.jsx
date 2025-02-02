const HotelSearch = () => {
  const inputStyles =
    'px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 h-full';
  const colSpanStyles = 'col-span-7 md:col-span-1';

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 border p-4 rounded-lg shadow-md">
      {/* Input para ubicación/nombre del hotel */}
      <input
        type="text"
        placeholder="Ubicación o nombre del hotel"
        className={`col-span-7 md:col-span-3 ${inputStyles}`}
      />

      {/* Input para fecha de inicio */}
      <input type="date" className={`${colSpanStyles} ${inputStyles}`} />

      {/* Input para fecha de fin */}
      <input type="date" className={`${colSpanStyles} ${inputStyles}`} />

      {/* Input para cantidad de personas */}
      <input
        type="number"
        min="1"
        placeholder="Personas"
        className={`${colSpanStyles} ${inputStyles}`}
      />

      {/* Botón de búsqueda */}
      <button className="col-span-7 md:col-span-1 px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-300 md:self-center h-full">
        Buscar
      </button>
    </div>
  );
};

export default HotelSearch;
