import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Bed,
  DoorOpen,
  Users,
  Calendar,
  Tag,
  Settings,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader } from '@admin-ui';
import { RedirectLink } from '@form';
import HabitacionesTab from '@/modules/admin/hotels/dashboard/HabitacionesTab';
import PersonalAsignadoTab from '@/modules/admin/hotels/dashboard/PersonalAsignadoTab';
import AjustesGeneralesTab from '@/modules/admin/hotels/dashboard/AjustesGeneralesTab';
import TarifasTab from '@/modules/admin/hotels/dashboard/TarifasTab';
import TemporadasTab from '@/modules/admin/hotels/dashboard/TemporadasTab';
import PaquetesTab from '@/modules/admin/hotels/dashboard/PaquetesTab';

export default function HotelDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCrumbLabel } = useBreadcrumbs();

  const [activeTab, setActiveTab] = useState('general');
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotelDashboardData();
  }, [id]);

  const fetchHotelDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/hotel/${id}`);
      setHotel(response.data);
      if (response.data.nombre) {
        setCrumbLabel(id, `${response.data.nombre} - Dashboard`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del dashboard del hotel');
      navigate('/admin/hoteles');
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: 'general', icon: Settings, label: 'Ajustes Generales' },
    { id: 'tarifas', icon: Bed, label: 'Tarifas y Tipos' },
    { id: 'habitaciones', icon: DoorOpen, label: 'Habitaciones Físicas' },
    { id: 'personal', icon: Users, label: 'Personal Asignado' },
    { id: 'temporadas', icon: Calendar, label: 'Temporadas y Descuentos' },
    { id: 'paquetes', icon: Tag, label: 'Paquetes Promocionales' },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard */}
      <PageHeader
        title={hotel?.nombre || 'Hotel'}
        description={loading ? 'Sincronizando datos...' : 'Dashboard de Configuración'}
        backTo="/admin/hoteles"
        icon={Building2}
        loading={loading}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navegación por Pestañas (Shell) */}
        <aside className="w-full lg:w-80 shrink-0">
          <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                disabled={loading && !hotel}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido Dinámico */}
        <main className="flex-1 w-full min-w-0">
          <div className="min-h-[500px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 relative flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <InnerLoading message="Hidratando dashboard..." />
              </div>
            ) : !hotel ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 dark:bg-red-900/20 dark:text-red-400">
                  No se pudo cargar la información del hotel.
                </div>
                <button 
                  onClick={fetchHotelDashboardData}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Reintentar carga
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 flex-1">
                {activeTab === 'general' && (
                  <AjustesGeneralesTab
                    hotelId={hotel.id}
                    initialData={hotel}
                    onUpdate={fetchHotelDashboardData}
                  />
                )}

                {activeTab === 'tarifas' && (
                  <TarifasTab hotelId={hotel.id} />
                )}

                {activeTab === 'habitaciones' && (
                  <HabitacionesTab
                    hotelId={hotel.id}
                    tarifasAsignadas={hotel.tarifas || []}
                  />
                )}

                {activeTab === 'personal' && (
                  <PersonalAsignadoTab hotelId={hotel.id} />
                )}

                {activeTab === 'temporadas' && (
                  <TemporadasTab hotelId={hotel.id} />
                )}

                {activeTab === 'paquetes' && (
                  <PaquetesTab hotelId={hotel.id} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
