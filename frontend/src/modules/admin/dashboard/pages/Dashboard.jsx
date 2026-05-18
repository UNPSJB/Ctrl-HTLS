import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  CalendarDays,
  UserCheck,
  Building2,
  Users,
  CreditCard,
  MapPin,
  Sun,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { capitalizeWords } from '@/utils/stringUtils';
import { useNavigate } from 'react-router-dom';
import {
  parseDate,
  formatFecha,
  toISODate,
  getStartOfWeek,
} from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import {
  getResumenVentas,
  getVentasPorFecha,
  getVentasAnuales,
  getTopVentas,
  getTopMediosPago,
  getTopCiudades,
} from '@/api/ventas/ventasService';
import {
  MOCK_HOTELES_TEMPORADA_ALTA,
  MOCK_HOTELES_TEMPORADA_BAJA,
} from '@/api/dashboard/dashboardMocks';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { ListHeader } from '@admin-ui';

// ─── Subcomponente: Card KPI con filas Hoy/Semana/Mes ──────────────────────
function KpiCard({ resumenVentas }) {
  const navigate = useNavigate();

  const handleNavigate = (periodo) => {
    const hoy = new Date();
    let fechaInicio;
    let fechaFin;

    if (periodo === 'dia') {
      // Un solo día: fechaFin === fechaInicio (el backend acepta igualdad)
      fechaInicio = toISODate(hoy);
      fechaFin = toISODate(hoy);
    } else if (periodo === 'semana') {
      // Lunes → Domingo de la semana actual usando el helper centralizado
      const lunes = getStartOfWeek();
      const domingo = new Date(lunes);
      domingo.setDate(domingo.getDate() + 6);

      fechaInicio = toISODate(lunes);
      fechaFin = toISODate(domingo);
    } else if (periodo === 'mes') {
      // Primer día → Último día del mes actual
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      fechaInicio = toISODate(primerDiaMes);
      fechaFin = toISODate(ultimoDiaMes);
    }

    navigate(`/admin/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  };

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
              onClick={() => handleNavigate(id)}
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

// ─── Subcomponente: Top 5 con toggle monto/cantidad ────────────────────────
function TopRankingCard({
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
            className={`rounded-md px-2 py-1 text-xs font-semibold transition-all ${
              modo === 'monto'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Monto
          </button>
          <button
            onClick={() => setModo('cantidad')}
            className={`rounded-md px-2 py-1 text-xs font-semibold transition-all ${
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

// ─── Subcomponente: Tooltip personalizado del gráfico ──────────────────────
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

// ─── Subcomponente: Gráfico anual de ventas ─────────────────────────────────
function GraficoAnual({ data }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Ventas por Mes — {new Date().getFullYear()}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Evolución del monto total de ventas durante el año
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
              dot={{ r: 3, fill: 'rgb(37 99 235)', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Subcomponente: Tabla de ventas del día ─────────────────────────────────
function VentasHoyCard({ ventas, fecha }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Ventas de Hoy
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFecha(fecha)}
        </p>
      </div>

      <div className="custom-scrollbar min-h-0 flex-grow overflow-y-auto pr-1">
        {ventas.length > 0 ? (
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {ventas.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Cliente:{' '}
                    {item.cliente
                      ? capitalizeWords(item.cliente)
                      : 'Cliente Final'}
                  </span>
                  <div className="flex items-center gap-1.5 truncate text-[11px] text-gray-500 dark:text-gray-400">
                    <span>
                      {item.hotel ? capitalizeWords(item.hotel) : '—'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>
                      {item.vendedor ? capitalizeWords(item.vendedor) : '—'}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(item.monto)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="mb-2 h-8 w-8 text-gray-200 dark:text-gray-700" />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Sin ventas registradas hoy
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponente: Hoteles en Temporada ────────────────────────────────────
function HotelesTemporadaCard({ dataAlta = [], dataBaja = [] }) {
  const [modo, setModo] = useState('alta');

  const listToRender = modo === 'alta' ? dataAlta : dataBaja;

  const formatDayMonth = (fechaStr) => {
    if (!fechaStr) return '';
    const dateObj = parseDate(fechaStr);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`rounded-lg p-2 transition-colors ${
              modo === 'alta'
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}
          >
            <Sun
              className={`h-4 w-4 transition-colors ${
                modo === 'alta'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Hoteles en Temporada
          </h3>
        </div>
        {/* Toggle alta / baja */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700/50">
          <button
            onClick={() => setModo('alta')}
            className={`cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-all ${
              modo === 'alta'
                ? 'bg-white text-amber-600 shadow-sm dark:bg-gray-800 dark:text-amber-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Alta
          </button>
          <button
            onClick={() => setModo('baja')}
            className={`cursor-pointer rounded-md px-2 py-1 text-xs font-semibold transition-all ${
              modo === 'baja'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Baja
          </button>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-grow overflow-y-auto pr-1">
        {listToRender.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {listToRender.map((hotel, idx) => {
              const inicioFormateado = formatDayMonth(hotel.fechaInicio);
              const finFormateado = formatDayMonth(hotel.fechaFin);
              return (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {hotel.nombre}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {inicioFormateado} → {finFormateado}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <Sun className="mb-2 h-8 w-8 text-gray-200 dark:text-gray-700" />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Sin hoteles en temporada
            </p>
          </div>
        )}
      </div>

      {/* Pie de card */}
      <div className="mt-2 border-t border-gray-200 pt-3 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Datos del mes actual
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumenVentas, setResumenVentas] = useState(null);
  const [ventasHoy, setVentasHoy] = useState([]);
  const [ventasAnuales, setVentasAnuales] = useState([]);
  const [topVentas, setTopVentas] = useState(null);
  const [topMediosPago, setTopMediosPago] = useState(null);
  const [topCiudades, setTopCiudades] = useState(null);

  // Las fechas se calculan DENTRO del componente para evitar valores
  // "rances" cuando el usuario deja la pestaña abierta al cambiar de día.
  const fechaHoy = toISODate(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.allSettled([
        getResumenVentas(),
        getVentasPorFecha(fechaHoy),
        getVentasAnuales(),
        getTopVentas(),
        getTopMediosPago(),
        getTopCiudades(),
      ]);

      if (results[0].status === 'fulfilled') {
        setResumenVentas(results[0].value);
      } else {
        toast.error('No se pudo cargar el resumen de ventas.');
      }

      if (
        results[1].status === 'fulfilled' &&
        Array.isArray(results[1].value)
      ) {
        setVentasHoy(results[1].value);
      } else {
        toast.error('No se pudieron cargar las ventas de hoy.');
      }

      if (results[2].status === 'fulfilled') {
        setVentasAnuales(results[2].value);
      }

      if (results[3].status === 'fulfilled') {
        setTopVentas(results[3].value);
      }

      if (results[4].status === 'fulfilled') {
        setTopMediosPago(results[4].value);
      }

      if (results[5].status === 'fulfilled') {
        setTopCiudades(results[5].value);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="custom-scrollbar h-full overflow-y-auto">
      <div className="animate-in fade-in flex flex-col gap-6 p-1 pb-8 duration-500">
        {/* Encabezado */}
        <ListHeader
          title="Panel de Control"
          description={
            <>
              Bienvenido/a,{' '}
              <span className="text-md font-bold tracking-wide text-blue-600 dark:text-blue-400">
                {capitalizeWords(user?.nombre) || 'Administrador'}
              </span>
              . Gestión de operaciones y estadísticas.
            </>
          }
          icon={Users}
        />

        {/* Contenido principal */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <InnerLoading message="Cargando resumen general..." />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-3"
            style={{
              gridTemplateRows: 'repeat(3, 300px)',
              gridAutoRows: '300px',
            }}
          >
            {/* Fila 1 */}
            <KpiCard resumenVentas={resumenVentas} />

            <TopRankingCard
              title="Top 5 Vendedores"
              icon={UserCheck}
              dataMonto={topVentas?.topVendedoresPorMonto}
              dataCantidad={topVentas?.topVendedoresPorCantidad}
              nameKey={(v) => `${v.nombre} ${v.apellido}`}
              colorClass={{
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                icon: 'text-purple-600 dark:text-purple-400',
                value: 'text-purple-600 dark:text-purple-400',
              }}
            />

            <TopRankingCard
              title="Top 5 Hoteles"
              icon={Building2}
              dataMonto={topVentas?.topHotelesPorMonto}
              dataCantidad={topVentas?.topHotelesPorCantidad}
              nameKey={(h) => h.nombre}
              colorClass={{
                bg: 'bg-teal-50 dark:bg-teal-900/20',
                icon: 'text-teal-600 dark:text-teal-400',
                value: 'text-teal-600 dark:text-teal-400',
              }}
            />

            {/* Fila 2 */}
            <TopRankingCard
              title="Top Métodos de Pago"
              icon={CreditCard}
              dataMonto={topMediosPago?.topMediosPagoPorMonto}
              dataCantidad={topMediosPago?.topMediosPagoPorCantidad}
              nameKey={(m) => m.medioPago}
              colorClass={{
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                icon: 'text-orange-600 dark:text-orange-400',
                value: 'text-orange-600 dark:text-orange-400',
              }}
            />

            <TopRankingCard
              title="Top 5 Ciudades"
              icon={MapPin}
              dataMonto={topCiudades?.topCiudadesPorMonto}
              dataCantidad={topCiudades?.topCiudadesPorCantidad}
              nameKey={(c) => c.nombre}
              colorClass={{
                bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                icon: 'text-indigo-600 dark:text-indigo-400',
                value: 'text-indigo-600 dark:text-indigo-400',
              }}
            />

            <HotelesTemporadaCard
              dataAlta={MOCK_HOTELES_TEMPORADA_ALTA}
              dataBaja={MOCK_HOTELES_TEMPORADA_BAJA}
            />

            {/* Fila 3 */}
            <div className="lg:col-span-2">
              <GraficoAnual data={ventasAnuales} />
            </div>
            <VentasHoyCard ventas={ventasHoy} fecha={fechaHoy} />
          </div>
        )}
      </div>
    </div>
  );
}
