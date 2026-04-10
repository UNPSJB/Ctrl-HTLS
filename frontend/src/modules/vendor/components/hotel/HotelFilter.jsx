import { Tag, Percent } from 'lucide-react';

function HotelFilter({ filters, setFilters }) {
  const letters = ['A', 'B', 'C'];

  const toggleLetter = (letter) => {
    const isSelected = filters.hospedajes.includes(letter);
    if (isSelected) {
      setFilters({ ...filters, hospedajes: filters.hospedajes.filter((l) => l !== letter) });
    } else {
      setFilters({ ...filters, hospedajes: [...filters.hospedajes, letter] });
    }
  };

  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mt-2 overflow-x-auto whitespace-nowrap gap-2 scrollbar-hide">

      {/* Lado Izquierdo: Clasificación A, B, C y Rango Estrellas */}
      <div className="flex items-center gap-4">

        {/* Hospedajes (A, B, C) sin fondo envolvente */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Hospedajes:</span>
          <div className="flex items-center gap-1.5">
            {letters.map((l) => {
              const active = filters.hospedajes.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLetter(l)}
                  className={`flex items-center justify-center w-8 h-7 text-xs font-bold rounded border transition-colors ${active ? 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-900/20 dark:text-blue-400' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:text-gray-500'}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

        <div className="flex items-center gap-3">
          <label htmlFor="stars-slider" className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center">
            Estrellas: <span className="text-blue-600 dark:text-blue-400 font-bold inline-block w-5 text-center ml-1">{filters.estrellas}</span>
          </label>
          <input
            id="stars-slider"
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={filters.estrellas}
            onChange={(e) => setFilters({ ...filters, estrellas: Number(e.target.value) })}
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((filters.estrellas - 1) / 4) * 100}%, #e5e7eb ${((filters.estrellas - 1) / 4) * 100}%, #e5e7eb 100%)`
            }}
            className="w-24 sm:w-32 h-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-150 ease-in-out dark:bg-gray-700 accent-blue-600"
          />
        </div>

      </div>

      {/* Lado Derecho: Switches Condiciones */}
      <div className="flex items-center gap-5">

        {/* Toggle Paquetes */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`flex items-center justify-center w-6 h-6 rounded-md border transition-colors ${filters.soloPaquetes ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={filters.soloPaquetes}
              onChange={(e) => setFilters({ ...filters, soloPaquetes: e.target.checked })}
            />
            <Tag className={`w-3.5 h-3.5 transition-colors ${filters.soloPaquetes ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 select-none">Con Paquetes</span>
        </label>

        {/* Toggle Descuentos */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`flex items-center justify-center w-6 h-6 rounded-md border transition-colors ${filters.soloDescuentos ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={filters.soloDescuentos}
              onChange={(e) => setFilters({ ...filters, soloDescuentos: e.target.checked })}
            />
            <Percent className={`w-3.5 h-3.5 transition-colors ${filters.soloDescuentos ? 'text-green-600 dark:text-green-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 select-none">Con Descuento</span>
        </label>
      </div>

    </div>
  );
}

export default HotelFilter;
