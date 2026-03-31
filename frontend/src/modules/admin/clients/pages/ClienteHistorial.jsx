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
import ClienteHistorialList from '../components/ClienteHistorialList';

// Vista de historial de alquileres/ventas de un cliente
const ClienteHistorial = () => {
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
      const response = await axiosInstance.get(`/cliente/${id}/ventas`);
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial del cliente');
      navigate('/admin/clientes');
    } finally {
      setLoading(false);
    }
  };

  const { clienteNombre, totalVentas, montoTotal, ventas = [] } = data || {};

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader
          title={data ? `Historial: ${clienteNombre}` : 'Historial del Cliente'}
          description="Consulte el historial de alquileres y facturación del cliente"
          backTo="/admin/clientes"
          icon={History}
          loading={loading && !data}
        />
      </div>

      {loading && !data ? (
        <div className="flex flex-1 items-center justify-center">
          <InnerLoading message="Cargando historial del cliente..." />
        </div>
      ) : (
        <>
          {/* Resumen de actividad - Estático */}
          <div className="flex-shrink-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total de Alquileres */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Alquileres Totales</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalVentas}</h3>
                </div>
              </div>
            </div>

            {/* Monto Total Gastado */}
            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/20 dark:bg-gray-800 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Inversión Total</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${montoTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            </div>

            {/* Promedio por alquiler */}
            <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900/20 dark:bg-gray-800 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Promedio por Alquiler</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalVentas > 0 ? (montoTotal / totalVentas).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Listado Detallado - Expandible */}
          <div className="flex-grow flex flex-col h-full overflow-hidden">
            <ClienteHistorialList data={ventas} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
};

export default ClienteHistorial;
