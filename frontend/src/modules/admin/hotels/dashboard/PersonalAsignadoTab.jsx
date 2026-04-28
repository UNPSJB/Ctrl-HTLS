import { useState, useEffect } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import PersonalAsignadoList from '../components/PersonalAsignadoList';
import PersonalFormModal from '../components/PersonalFormModal';
import AppButton from '@/components/ui/AppButton';

/**
 * Gestión de personal (vendedores) asignados a un hotel específico.
 * Componente autónomo: carga su propia lista de asignados desde getHotelById.
 */
export default function PersonalAsignadoTab({ hotelId, isActive = false }) {
  const [asignados, setAsignados] = useState([]);
  const [todosVendedores, setTodosVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Carga inicial de asignados al montar o cambiar hotelId / activar pestaña
  useEffect(() => {
    if (isActive) {
      fetchAsignados();
    }
  }, [hotelId, isActive]);

  // Cargar lista de todos los vendedores solo cuando se abre el modo asignación
  useEffect(() => {
    if (isAssigning) {
      fetchTodosVendedores();
    }
  }, [isAssigning]);

  const fetchAsignados = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/hotel/${hotelId}`);
      setAsignados(data.vendedores || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el personal asignado');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosVendedores = async () => {
    try {
      const res = await axiosInstance.get('/vendedores');
      setTodosVendedores(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la lista de vendedores');
    }
  };

  const handleAsignar = async (vendedor) => {
    try {
      setLoadingAction(true);
      await axiosInstance.post('/hotel/asignar-empleado', {
        hotelId: Number(hotelId),
        vendedorId: Number(vendedor.id),
      });
      toast.success('Vendedor asignado correctamente');
      setIsAssigning(false);
      await fetchAsignados();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al asignar vendedor');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDesasignar = async (vendedorId) => {
    if (!window.confirm('¿Confirma remover este vendedor de la lista?')) return;
    try {
      setLoadingAction(true);
      await axiosInstance.post('/hotel/desasignar-empleado', {
        hotelId: Number(hotelId),
        vendedorId: Number(vendedorId),
      });
      toast.success('Acceso revocado correctamente');
      await fetchAsignados();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al remover vendedor');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-blue-500" />
            Personal de Ventas Autorizado
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Solo los vendedores listados aquí podrán realizar alquileres en este hotel.
          </p>
        </div>

        <AppButton
          onClick={() => setIsAssigning(true)}
          disabled={loading}
          icon={UserPlus}
        >
          Autorizar Nuevo Vendedor
        </AppButton>
      </div>

      <div className="flex-grow mt-6 flex flex-col overflow-hidden relative">
        {/* Tabla de asignados */}
        <PersonalAsignadoList
          data={asignados}
          loading={loading}
          loadingAction={loadingAction}
          onDesasignar={handleDesasignar}
        />
      </div>

      {/* Modal de Asignación */}
      <PersonalFormModal
        isOpen={isAssigning}
        onClose={() => setIsAssigning(false)}
        asignados={asignados}
        todosVendedores={todosVendedores}
        onSave={handleAsignar}
        loading={loadingAction}
      />
    </div>
  );
}

