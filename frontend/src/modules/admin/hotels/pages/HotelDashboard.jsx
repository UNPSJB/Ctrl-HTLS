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
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
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

      <SidebarLayout
        sidebar={
          <PageSidebar
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            loading={loading && !hotel}
          />
        }
      >
        <PageContentCard className="">

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
            <div className="">
              <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                <AjustesGeneralesTab
                  hotelId={hotel.id}
                  initialData={hotel}
                  onUpdate={fetchHotelDashboardData}
                />
              </div>

              <div className={activeTab === 'tarifas' ? 'block' : 'hidden'}>
                <TarifasTab hotelId={hotel.id} />
              </div>

              <div className={activeTab === 'habitaciones' ? 'block' : 'hidden'}>
                <HabitacionesTab
                  hotelId={hotel.id}
                  tarifasAsignadas={hotel.tarifas || []}
                />
              </div>

              <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
                <PersonalAsignadoTab hotelId={hotel.id} />
              </div>

              <div className={activeTab === 'temporadas' ? 'block' : 'hidden'}>
                <TemporadasTab hotelId={hotel.id} />
              </div>

              <div className={activeTab === 'paquetes' ? 'block' : 'hidden'}>
                <PaquetesTab hotelId={hotel.id} />
              </div>
            </div>
          )}
        </PageContentCard>
      </SidebarLayout>
    </div>
  );
}
