
import { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
  CalendarDays,
  UserCheck,
  Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { Link } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatFecha } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { getResumenVentas, getVentasPorFecha } from '@/api/ventas/ventasService';

// Se usa la fecha en UTC para que coincida con cómo el backend almacena
// y filtra las facturas (new Date() en Node.js = UTC puro).
// Si se enviara la fecha local (UTC-3), el rango de búsqueda del backend
// quedaría desplazado 3 horas, mostrando ventas del día anterior.
const FECHA_HOY = new Date().toISOString().split('T')[0];
// fecha para debug siempre un dia demas al que se busca
// const FECHA_HOY = '2026-05-06';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalHoteles, setTotalHoteles] = useState(0);
  const [resumenVentas, setResumenVentas] = useState(null);   // { dia, semana, mes }
  const [ventasHoy, setVentasHoy] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          axiosInstance.get('/hoteles'),
          getResumenVentas(),
          getVentasPorFecha(FECHA_HOY)
        ]);

        const hotelesCount =
          results[0].status === 'fulfilled' && Array.isArray(results[0].value.data)
            ? results[0].value.data.length
            : 0;

        const resumen = results[1].status === 'fulfilled' ? results[1].value : null;
        const ventas = results[2].status === 'fulfilled' && Array.isArray(results[2].value)
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
              Bienvenido,{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {capitalizeWords(user?.nombre) || 'Administrador'}
              </span>
              . Gestión de operaciones y estadísticas.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 shrink-0 pt-1">
            <Calendar className="w-4 h-4" />
            <span>{formatFecha(new Date())}</span>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <InnerLoading message="Cargando resumen general..." />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cards de Estadísticas — 4 en una sola fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Card 1: Total Hoteles (existente) */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalHoteles}</p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hoteles</h3>
              </div>

              {/* Card 2: Ventas de Hoy */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resumenVentas?.dia?.cantidad ?? '—'}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas de Hoy</h3>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                  {formatCurrency(resumenVentas?.dia?.total)}
                </p>
              </div>

              {/* Card 3: Ventas de la Semana */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <CalendarDays className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resumenVentas?.semana?.cantidad ?? '—'}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas esta Semana</h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">
                  {formatCurrency(resumenVentas?.semana?.total)}
                </p>
              </div>

              {/* Card 4: Ventas del Mes */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resumenVentas?.mes?.cantidad ?? '—'}
                  </p>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas del Mes</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  {formatCurrency(resumenVentas?.mes?.total)}
                </p>
              </div>
            </div>

            {/* Sección Secundaria: Ventas de Hoy y Accesos Directos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Ventas de Hoy (actividad real del día) */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-green-500" />
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
                        className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                      >
                        <div className="p-2 rounded-lg shrink-0 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.hotel ? capitalizeWords(item.hotel) : 'Hotel desconocido'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {item.cliente ? capitalizeWords(item.cliente) : '—'}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {item.vendedor ? capitalizeWords(item.vendedor) : '—'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(item.monto)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No hubo ventas registradas hoy.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Accesos Rápidos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Accesos Rápidos</h3>
                <div className="space-y-3 flex-1">
                  <Link
                    to="/admin/hoteles/nuevo"
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Nuevo Hotel</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/admin/vendedores/nuevo"
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Registrar Vendedor</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/admin/clientes/nuevo"
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Nuevo Cliente</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <p className="text-xs font-medium text-blue-100 uppercase tracking-wider mb-1">Tip del día</p>
                    <p className="text-sm font-medium">Revisa las liquidaciones pendientes para cerrar la semana.</p>
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
