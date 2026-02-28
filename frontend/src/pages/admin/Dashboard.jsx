
import { useState, useEffect } from 'react';
import { Building2, Users, UserCheck, TrendingUp, DollarSign, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { Link } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHoteles: 0,
    vendedoresActivos: 0,
    totalClientes: 0,
    ingresosMensuales: 84300 // Simulados por ahora
  });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          axiosInstance.get('/hoteles'),
          axiosInstance.get('/vendedores'),
          axiosInstance.get('/clientes')
        ]);

        const hotelesCount = results[0].status === 'fulfilled' ? (Array.isArray(results[0].value.data) ? results[0].value.data.length : 0) : 0;
        const vendedoresCount = results[1].status === 'fulfilled' ? (Array.isArray(results[1].value.data) ? results[1].value.data.length : 0) : 0;
        const clientesCount = results[2].status === 'fulfilled' ? (Array.isArray(results[2].value.data) ? results[2].value.data.length : 0) : 0;

        setStats(prev => ({
          ...prev,
          totalHoteles: hotelesCount,
          vendedoresActivos: vendedoresCount,
          totalClientes: clientesCount
        }));

        // Datos de Actividad Simulados (Mejorados visualmente)
        setActivity([
          { id: 1, descripcion: 'Nueva reserva confirmada', cliente: 'Juan Pérez', hotel: 'Hotel Paradise Resort', fecha: new Date().toISOString(), monto: 12500 },
          { id: 2, descripcion: 'Nueva reserva confirmada', cliente: 'María González', hotel: 'Grand Hotel Central', fecha: new Date(Date.now() - 3600000).toISOString(), monto: 8900 },
          { id: 3, descripcion: 'Nuevo registro de cliente', cliente: 'Carlos López', hotel: 'Sunset Beach Hotel', fecha: new Date(Date.now() - 7200000).toISOString(), monto: 0 }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const headerDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado Externo de Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Control
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Bienvenido, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.nombre || 'Administrador'}</span>. Gestión de operaciones y estadísticas.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{headerDate}</span>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <InnerLoading message="Cargando resumen general..." />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cards de Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Hoteles */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Hoteles</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalHoteles}</p>
              </div>

              {/* Total Vendedores */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vendedores Activos</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.vendedoresActivos}</p>
              </div>

              {/* Total Clientes */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Clientes</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClientes}</p>
              </div>

              {/* Ingresos Mensuales */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ingresos (Est. Mes)</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats.ingresosMensuales)}
                </p>
              </div>
            </div>

            {/* Sección Secundaria: Actividad Reciente y Accesos Directos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Actividad Reciente */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Actividad Reciente
                  </h3>
                  <button className="text-xs font-medium text-blue-600 hover:underline">Ver todo</button>
                </div>
                <div className="space-y-6">
                  {activity.length > 0 ? (
                    activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                        <div className={`p-2 rounded-lg shrink-0 ${item.monto > 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                          {item.monto > 0 ? <TrendingUp className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.descripcion}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.cliente}</span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">{item.hotel}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-400 mb-1">
                            {new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {item.monto > 0 && (
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                              + {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.monto)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No hay actividad reciente para mostrar.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Accesos Rápidos</h3>
                <div className="space-y-3 flex-1">
                  <Link to="/admin/hoteles/nuevo" className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Nuevo Hotel</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link to="/admin/vendedores/nuevo" className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Registrar Vendedor</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link to="/admin/clientes/nuevo" className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 transition-all group">
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
