import { useState } from 'react';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatCurrency } from '@/utils/pricingUtils';

// Tarjeta genérica de ranking de elementos (Vendedores, Hoteles, Métodos de Pago, etc.)
export default function TopRankingCard({
  title,
  icon: Icon,
  dataMonto,
  dataCantidad,
  nameKey,
  colorClass,
}) {
  const [modo, setModo] = useState('monto');

  const listToRender = modo === 'monto' ? dataMonto || [] : dataCantidad || [];

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-2 ${colorClass.bg}`}>
            <Icon className={`h-4 w-4 ${colorClass.icon}`} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {/* Toggle monto / cantidad */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700/50">
          <button
            onClick={() => setModo('monto')}
            className={`cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-all ${
              modo === 'monto'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Monto
          </button>
          <button
            onClick={() => setModo('cantidad')}
            className={`cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-all ${
              modo === 'cantidad'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Cant.
          </button>
        </div>
      </div>

      {/* Lista */}
      <ol className="custom-scrollbar flex min-h-0 flex-grow flex-col gap-2 overflow-y-auto pr-1">
        {listToRender.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs font-bold text-gray-400 dark:text-gray-500">
                {idx + 1}
              </span>
              <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                {capitalizeWords(nameKey(item))}
              </span>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold ${colorClass.value}`}
            >
              {modo === 'monto'
                ? formatCurrency(item.montoTotal)
                : `${item.cantidadVentas} ventas`}
            </span>
          </li>
        ))}
      </ol>

      {/* Pie de card */}
      <div className="mt-2 border-t border-gray-200 pt-3 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Datos del mes actual
        </p>
      </div>
    </div>
  );
}
