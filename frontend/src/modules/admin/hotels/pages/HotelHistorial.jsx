import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  History,
  TrendingUp,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader } from '@admin-ui';
import HotelHistorialTable from '../components/HotelHistorialTable';
import { capitalizeWords } from '@/utils/stringUtils';

// Vista de historial de ventas y operaciones de un hotel
const HotelHistorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/hotel/${id}/historial-ventas`);
      const ventas = response.data;
      
      let hotelNombre = 'Hotel';
      try {
        const hotelRes = await axiosInstance.get(`/hotel/${id}`);
        if (hotelRes.data && hotelRes.data.nombre) {
          hotelNombre = hotelRes.data.nombre;
        }
      } catch (e) {
      }

      const totalVentas = ventas.length;
      const montoTotal = ventas.reduce((acc, v) => acc + (Number(v.monto) || 0), 0);

      setData({
        hotelNombre,
        totalVentas,
        montoTotal,
        ventas
      });
    } catch (error) {
      setData({
        hotelNombre: 'Hotel Desconocido',
        totalVentas: 0,
        montoTotal: 0,
        ventas: []
      });
      toast.error('No se pudo cargar el historial del hotel.');
    } finally {
      setLoading(false);
    }
  };

  const { hotelNombre, totalVentas = 0, montoTotal = 0, ventas = [] } = data || {};

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader
          title={data && hotelNombre ? `Historial: ${capitalizeWords(hotelNombre)}` : 'Historial del Hotel'}
          description="Consulte el historial de ventas y facturación realizadas en este hotel"
          backTo="/admin/hoteles"
          icon={History}
          loading={loading && !data}
        />
      </div>

      {loading && !data ? (
        <div className="flex flex-1 items-center justify-center">
          <InnerLoading message="Cargando historial del hotel..." />
        </div>
      ) : (
        <>
          <div className="flex-grow flex flex-col h-full overflow-hidden">
            <HotelHistorialTable data={ventas} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
};

export default HotelHistorial;
