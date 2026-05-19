import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserCheck } from 'lucide-react';
import DashboardLayout from '@/modules/admin/dashboard/components/DashboardLayout';
import ResumenVentasCard from '@/components/ui/dashboard/ResumenVentasCard';
import GraficoAnualCard from '@/components/ui/dashboard/GraficoAnualCard';
import TopRankingCard from '@/components/ui/dashboard/TopRankingCard';
import { toISODate, getStartOfWeek } from '@/utils/dateUtils';
import {
  getResumenVentasHotel,
  getVentasAnualesHotel,
  getTopVendedoresHotel
} from '@/api/ventas/ventasService';

// Vista del Dashboard de métricas del hotel
export default function HotelDashboard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Si se accede directamente por URL, podríamos no tener el objeto en state
  const hotelBase = location.state?.hotel || { 
    nombre: `Hotel #${id}`, 
    ubicacion: {} 
  };

  const [loading, setLoading] = useState(true);
  const [resumenVentas, setResumenVentas] = useState(null);
  const [ventasAnuales, setVentasAnuales] = useState(null);
  const [topVendedores, setTopVendedores] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getResumenVentasHotel(id),
        getVentasAnualesHotel(id),
        getTopVendedoresHotel(id),
      ]);

      if (results[0].status === 'fulfilled') {
        setResumenVentas(results[0].value);
      } else {
        toast.error('No se pudo cargar el resumen de ventas del hotel.');
      }

      if (results[1].status === 'fulfilled') {
        setVentasAnuales(results[1].value);
      } else {
        toast.error('No se pudo cargar el gráfico anual del hotel.');
      }

      if (results[2].status === 'fulfilled') {
        setTopVendedores(results[2].value);
      } else {
        toast.error('No se pudieron cargar los vendedores del hotel.');
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleNavigate = (periodo) => {
    const hoy = new Date();
    let fechaInicio;
    let fechaFin;

    if (periodo === 'dia') {
      fechaInicio = toISODate(hoy);
      fechaFin = toISODate(hoy);
    } else if (periodo === 'semana') {
      const lunes = getStartOfWeek();
      const domingo = new Date(lunes);
      domingo.setDate(domingo.getDate() + 6);

      fechaInicio = toISODate(lunes);
      fechaFin = toISODate(domingo);
    } else if (periodo === 'mes') {
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      fechaInicio = toISODate(primerDiaMes);
      fechaFin = toISODate(ultimoDiaMes);
    }

    navigate(`/admin/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&nombreHotel=${encodeURIComponent(hotelBase.nombre)}`);
  };

  return (
    <DashboardLayout
      title={hotelBase.nombre}
      description={
        hotelBase.ubicacion?.nombreCiudad
          ? `${hotelBase.ubicacion.nombreCiudad}, ${hotelBase.ubicacion.nombreProvincia || ''}`
          : 'Métricas de operaciones y ventas'
      }
      loading={loading}
    >
      <div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-2"
        style={{
          gridTemplateRows: 'repeat(2, 300px)',
          gridAutoRows: '300px',
        }}
      >
        {/* Fila 1 */}
        <ResumenVentasCard resumenVentas={resumenVentas} onNavigate={handleNavigate} />

        <TopRankingCard
          title="Vendedores del Hotel"
          icon={UserCheck}
          dataMonto={topVendedores?.topVendedoresPorMonto}
          dataCantidad={topVendedores?.topVendedoresPorCantidad}
          nameKey={(v) => `${v.nombre} ${v.apellido}`}
          colorClass={{
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: 'text-purple-600 dark:text-purple-400',
            value: 'text-purple-600 dark:text-purple-400',
          }}
        />

        {/* Fila 2 */}
        <div className="lg:col-span-2">
          <GraficoAnualCard data={ventasAnuales} />
        </div>
      </div>
    </DashboardLayout>
  );
}
