
import { useState, useEffect } from 'react';
import { Building2, Users, UserCheck, TrendingUp, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHoteles: 24, // Mock
    vendedoresActivos: 0, // Real
    nuevosClientes: 0, // Real (Total)
    ingresosMensuales: 84300 // Mock
  });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real data where possible using allSettled to prevent full crash
        const results = await Promise.allSettled([
          axiosInstance.get('/vendedores'),
          axiosInstance.get('/clientes')
        ]);

        const vendedoresRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
        if (results[0].status === 'rejected') console.error('Error fetching vendedores:', results[0].reason);

        const clientesRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        if (results[1].status === 'rejected') console.error('Error fetching clientes:', results[1].reason);

        const vendedoresCount = Array.isArray(vendedoresRes.data) ? vendedoresRes.data.length : 0;
        const clientesCount = Array.isArray(clientesRes.data) ? clientesRes.data.length : 0;

        setStats(prev => ({
          ...prev,
          vendedoresActivos: vendedoresCount,
          nuevosClientes: clientesCount
        }));

        // Mock Activity data
        setActivity([
          {
            id: 1,
            descripcion: 'Nueva reserva confirmada',
            cliente: 'Juan Pérez',
            hotel: 'Hotel Paradise Resort',
            fecha: new Date().toISOString()
          },
          {
            id: 2,
            descripcion: 'Nueva reserva confirmada',
            cliente: 'María González',
            hotel: 'Grand Hotel Central',
            fecha: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 3,
            descripcion: 'Nueva reserva confirmada',
            cliente: 'Carlos López',
            hotel: 'Sunset Beach Hotel',
            fecha: new Date(Date.now() - 7200000).toISOString()
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback for real data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header de Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de Control
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenido de nuevo, {user?.nombre || 'Administrador'}. Aquí tienes un resumen de tu hotel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Cards de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Hoteles (MOCKED) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {/* <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.5%
            </span> */}
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Total Hoteles
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalHoteles}</p>
        </div>

        {/* Total Vendedores (REAL) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Vendedores Activos
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.vendedoresActivos}</p>
        </div>

        {/* Total Clientes (REAL) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Total Clientes
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.nuevosClientes}</p>
        </div>

        {/* Ingresos Mensuales (MOCKED) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Ingresos Mensuales (Est.)
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats.ingresosMensuales)}
          </p>
        </div>
      </div>

      {/* Sección Secundaria: Actividad Reciente y Accesos Directos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividad Reciente (MOCKED) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Actividad Reciente (Simulada)
          </h3>
          <div className="space-y-6">
            {activity.length > 0 ? (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.descripcion} - {item.cliente}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(item.fecha).toLocaleString()} • {item.hotel}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay actividad reciente para mostrar.</p>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Accesos Rápidos
          </h3>
          <div className="space-y-3">
            <Link to="/admin/hoteles/nuevo" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Nuevo Hotel</span>
            </Link>
            <Link to="/admin/vendedores/nuevo" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Registrar Vendedor</span>
            </Link>
            <Link to="/admin/clientes/nuevo" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Nuevo Cliente</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
