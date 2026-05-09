import { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
  CalendarDays,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { Link } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatFecha } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import {
  getResumenVentas,
  getVentasPorFecha,
} from '@/api/ventas/ventasService';

// Obtenemos la fecha actual local
const hoyLocal = new Date();
const FECHA_HOY = `${hoyLocal.getFullYear()}-${String(hoyLocal.getMonth() + 1).padStart(2, '0')}-${String(hoyLocal.getDate()).padStart(2, '0')}`;

// Calcula el día siguiente para fechaFin asegurando que el backend abarque hasta las 23:59 locales
const mananaLocal = new Date(hoyLocal);
mananaLocal.setDate(mananaLocal.getDate() + 1);
const FECHA_MANANA = `${mananaLocal.getFullYear()}-${String(mananaLocal.getMonth() + 1).padStart(2, '0')}-${String(mananaLocal.getDate()).padStart(2, '0')}`;

// Calcula fechas para la semana (lunes a domingo) local
const startOfWeek = new Date(hoyLocal);
startOfWeek.setDate(hoyLocal.getDate() - hoyLocal.getDay() + 1); // Lunes
const FECHA_INICIO_SEMANA = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 7); // Lunes siguiente
const FECHA_FIN_SEMANA = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`;

// Calcula fechas para el mes (1 del mes a fin del mes) local
const startOfMonth = new Date(hoyLocal.getFullYear(), hoyLocal.getMonth(), 1);
const endOfMonth = new Date(hoyLocal.getFullYear(), hoyLocal.getMonth() + 1, 1); // Primer día del mes siguiente
const FECHA_INICIO_MES = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(startOfMonth.getDate()).padStart(2, '0')}`;
const FECHA_FIN_MES = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalHoteles, setTotalHoteles] = useState(0);
  const [resumenVentas, setResumenVentas] = useState(null); // { dia, semana, mes }
  const [ventasHoy, setVentasHoy] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          axiosInstance.get('/hoteles'),
          getResumenVentas(),
          getVentasPorFecha(FECHA_HOY),
        ]);

        const hotelesCount =
          results[0].status === 'fulfilled' &&
          Array.isArray(results[0].value.data)
            ? results[0].value.data.length
            : 0;

        const resumen =
          results[1].status === 'fulfilled' ? results[1].value : null;
        const ventas =
          results[2].status === 'fulfilled' && Array.isArray(results[2].value)
            ? results[2].value
            : [];

        setTotalHoteles(hotelesCount);
        setResumenVentas(resumen);
        setVentasHoy(ventas);
      } catch (error) {
        // Errores individuales ya son absorbidos por Promise.allSettled
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado de Bienvenida */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Control
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Bienvenido/a,{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {capitalizeWords(user?.nombre) || 'Administrador'}
              </span>
              . Gestión de operaciones y estadísticas.
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <InnerLoading message="Cargando resumen general..." />
          </div>
        ) : (
          <div className="animate-in fade-in space-y-8 duration-500">
            {/* Cards de Estadísticas — 4 en una sola fila */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Total Hoteles (existente) */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-800">
                <div className="mb-2 flex items-center justify-between">
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalHoteles}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Hoteles
                </h3>
              </div>

              {/* Card 2: Ventas de Hoy */}
              <Link
                to={`/admin/ventas?fechaInicio=${FECHA_HOY}&fechaFin=${FECHA_MANANA}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-green-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resumenVentas?.dia?.cantidad ?? '—'}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ventas de Hoy
                </h3>
                <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(resumenVentas?.dia?.total)}
                </p>
              </Link>

              {/* Card 3: Ventas de la Semana */}
              <Link
                to={`/admin/ventas?fechaInicio=${FECHA_INICIO_SEMANA}&fechaFin=${FECHA_FIN_SEMANA}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
                    <CalendarDays className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resumenVentas?.semana?.cantidad ?? '—'}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ventas esta Semana
                </h3>
                <p className="mt-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                  {formatCurrency(resumenVentas?.semana?.total)}
                </p>
              </Link>

              {/* Card 4: Ventas del Mes */}
              <Link
                to={`/admin/ventas?fechaInicio=${FECHA_INICIO_MES}&fechaFin=${FECHA_FIN_MES}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resumenVentas?.mes?.cantidad ?? '—'}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ventas del Mes
                </h3>
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(resumenVentas?.mes?.total)}
                </p>
              </Link>
            </div>

            {/* Sección Secundaria: Ventas de Hoy y Accesos Directos */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Ventas de Hoy (actividad real del día) */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                <div className="mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Ventas de Hoy
                  </h3>
                  <span className="text-sm font-normal text-gray-400">
                    — {formatFecha(new Date())}
                  </span>
                </div>

                <div className="space-y-4">
                  {ventasHoy.length > 0 ? (
                    ventasHoy.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
                      >
                        <div className="shrink-0 rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {item.hotel
                              ? capitalizeWords(item.hotel)
                              : 'Hotel desconocido'}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {item.cliente
                                ? capitalizeWords(item.cliente)
                                : '—'}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">
                              •
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {item.vendedor
                                ? capitalizeWords(item.vendedor)
                                : '—'}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(item.monto)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                      <TrendingUp className="mb-3 h-10 w-10 opacity-20" />
                      <p className="text-sm font-medium">
                        No hubo ventas registradas hoy.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Accesos Rápidos */}
              <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
                  Accesos Rápidos
                </h3>
                <div className="flex-1 space-y-3">
                  <Link
                    to="/admin/hoteles/nuevo"
                    className="group flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900/20 dark:hover:bg-blue-900/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-900 dark:text-blue-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        Nuevo Hotel
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/admin/vendedores/nuevo"
                    className="group flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-900/20 dark:hover:bg-purple-900/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2 text-purple-600 transition-transform group-hover:scale-110 dark:bg-purple-900 dark:text-purple-400">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        Registrar Vendedor
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/admin/clientes/nuevo"
                    className="group flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-900/20 dark:hover:bg-orange-900/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-100 p-2 text-orange-600 transition-transform group-hover:scale-110 dark:bg-orange-900 dark:text-orange-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        Nuevo Cliente
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
                  <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-100">
                      Tip del día
                    </p>
                    <p className="text-sm font-medium">
                      Revisa las liquidaciones pendientes para cerrar la semana.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
