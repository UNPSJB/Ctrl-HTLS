import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/pricingUtils';

// Tooltip personalizado para el gráfico
function GraficoTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// Tarjeta genérica con gráfico de línea de ventas anuales
export default function GraficoAnualCard({
  data,
  titulo = `Ventas por Mes — ${new Date().getFullYear()}`,
  descripcion = 'Evolución del monto total de ventas durante el año',
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {titulo}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {descripcion}
        </p>
      </div>

      <div className="min-h-0 flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(229 231 235)"
              className="dark:[&_line]:stroke-gray-700"
            />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: 'rgb(107 114 128)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgb(107 114 128)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip content={<GraficoTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="rgb(37 99 235)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'rgb(37, 99, 235)', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
