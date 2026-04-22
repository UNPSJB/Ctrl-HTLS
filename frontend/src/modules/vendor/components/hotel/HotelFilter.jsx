import { ArrowDownAZ, ArrowUpZA } from 'lucide-react';

export const CATEGORIAS = ['A', 'B', 'C', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'];

function HotelFilter({ filters, setFilters }) {
  const currentCat = CATEGORIAS[filters.categoriaMaxIndex] || '5';

  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mt-2 overflow-x-auto whitespace-nowrap gap-4 scrollbar-hide">

      {/* Lado Izquierdo: Slider de Categoría */}
      <div className="flex items-center gap-2 shrink-0">
        <label htmlFor="cat-slider" className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center">
          Máximo: <span className="text-blue-600 dark:text-blue-400 font-extrabold inline-block w-8 text-center ml-1">{currentCat}</span>
        </label>
        <input
          id="cat-slider"
          type="range"
          min="0"
          max="11"
          step="1"
          value={filters.categoriaMaxIndex}
          onChange={(e) => setFilters({ ...filters, categoriaMaxIndex: Number(e.target.value) })}
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(filters.categoriaMaxIndex / 11) * 100}%, #e5e7eb ${(filters.categoriaMaxIndex / 11) * 100}%, #e5e7eb 100%)`
          }}
          className="w-32 sm:w-40 h-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-150 ease-in-out dark:bg-gray-700 accent-blue-600"
        />
      </div>

      {/* Lado Derecho: Botones (Pills) */}
      <div className="flex items-center gap-2.5 shrink-0">

        {/* Toggle Paquetes */}
        <button
          onClick={() => setFilters({ ...filters, soloPaquetes: !filters.soloPaquetes })}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider transition-colors border ${filters.soloPaquetes
            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800'
            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800'
            }`}
        >
          Paquetes
        </button>

        {/* Toggle Descuentos */}
        <button
          onClick={() => setFilters({ ...filters, soloDescuentos: !filters.soloDescuentos })}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider transition-colors border ${filters.soloDescuentos
            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800'
            }`}
        >
          Descuentos
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1.5"></div>

        {/* Toggle Orden */}
        <button
          onClick={() => setFilters({ ...filters, ordenDescendente: !filters.ordenDescendente })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider transition-colors border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {filters.ordenDescendente ? 'Mayor Categoría' : 'Menor Categoría'}
          {filters.ordenDescendente ? (
            <ArrowDownAZ className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpZA className="w-3.5 h-3.5" />
          )}
        </button>

      </div>
    </div>
  );
}

export default HotelFilter;
