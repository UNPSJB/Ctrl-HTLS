import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/pricingUtils';

// Tarjeta genérica para mostrar el resumen de ventas (Hoy/Semana/Mes)
export default function ResumenVentasCard({ resumenVentas, onNavigate }) {
  const periodos = [
    { id: 'dia', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
  ];

  return (
    <div className="flex h-full min-w-0 flex-col gap-4 overflow-x-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Resumen de Ventas
        </h3>
      </div>

      <div className="custom-scrollbar flex min-h-0 min-w-0 flex-grow flex-col divide-y divide-gray-100 overflow-y-auto overflow-x-hidden pr-1 dark:divide-gray-800">
        {periodos.map(({ id, label }) => {
          const datos = resumenVentas?.[id];
          return (
            <div
              key={id}
              onClick={() => onNavigate && onNavigate(id)}
              className="group -mx-2 flex cursor-pointer items-center justify-between rounded-lg px-2 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400">
                  {label}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {datos?.cantidad ?? 0} ventas
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(datos?.total ?? 0)}
                </p>
                <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
