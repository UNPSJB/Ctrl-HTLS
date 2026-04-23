import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Bed,
  Box,
  DoorOpen,
  Users,
  Calendar,
  Tag,
  Settings,
} from 'lucide-react';
import { capitalizeWords } from '@/utils/stringUtils';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
import HabitacionesTab from '@/modules/admin/hotels/dashboard/HabitacionesTab';
import PersonalAsignadoTab from '@/modules/admin/hotels/dashboard/PersonalAsignadoTab';
import AjustesGeneralesTab from '@/modules/admin/hotels/dashboard/AjustesGeneralesTab';
import TarifasTab from '@/modules/admin/hotels/dashboard/TarifasTab';
import PaquetesTab from '@/modules/admin/hotels/dashboard/PaquetesTab';
import TemporadasTab from '@/modules/admin/hotels/dashboard/TemporadasTab';
import DescuentosTab from '@/modules/admin/hotels/dashboard/DescuentosTab';
import AppButton from '@/components/ui/AppButton';

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
    { id: 'temporadas', icon: Calendar, label: 'Temporadas' },
    { id: 'descuentos', icon: Tag, label: 'Descuentos por Cantidad' },
    { id: 'paquetes', icon: Box, label: 'Paquetes Turísticos' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Encabezado del Dashboard */}
      <div className="flex-shrink-0">
        <PageHeader
          title={hotel?.nombre ? capitalizeWords(hotel.nombre) : 'Hotel'}
          description={loading ? 'Sincronizando datos...' : 'Dashboard de Configuración'}
          backTo="/admin/hoteles"
          icon={Building2}
          loading={loading}
        />
      </div>

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
              <AppButton
                onClick={fetchHotelDashboardData}
                variant="outline"
              >
                Reintentar carga
              </AppButton>
            </div>
          ) : (
            <div className="flex-grow flex flex-col relative overflow-hidden">
              <div className={activeTab === 'general' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <AjustesGeneralesTab
                  hotelId={hotel.id}
                  initialData={hotel}
                  onUpdate={fetchHotelDashboardData}
                  isActive={activeTab === 'general'}
                />
              </div>

              <div className={activeTab === 'tarifas' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <TarifasTab hotelId={hotel.id} isActive={activeTab === 'tarifas'} />
              </div>

              <div className={activeTab === 'habitaciones' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <HabitacionesTab
                  hotelId={hotel.id}
                  tarifasAsignadas={hotel.tarifas || []}
                  isActive={activeTab === 'habitaciones'}
                />
              </div>

              <div className={activeTab === 'personal' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <PersonalAsignadoTab hotelId={hotel.id} isActive={activeTab === 'personal'} />
              </div>

              <div className={activeTab === 'temporadas' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <TemporadasTab hotelId={hotel.id} isActive={activeTab === 'temporadas'} />
              </div>

              <div className={activeTab === 'descuentos' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <DescuentosTab hotelId={hotel.id} isActive={activeTab === 'descuentos'} />
              </div>

              <div className={activeTab === 'paquetes' ? 'h-full flex flex-col overflow-hidden' : 'hidden'}>
                <PaquetesTab hotelId={hotel.id} isActive={activeTab === 'paquetes'} />
              </div>

            </div>
          )}
        </PageContentCard>
      </SidebarLayout>
    </div>
  );
}
