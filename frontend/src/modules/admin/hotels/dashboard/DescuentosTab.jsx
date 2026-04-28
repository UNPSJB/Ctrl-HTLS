import { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import DescuentosList from '../components/DescuentosList';
import DescuentoFormModal from '../components/DescuentoFormModal';
import AppButton from '@/components/ui/AppButton';

export default function DescuentosTab({ hotelId, isActive = false }) {
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isActive) {
      fetchDescuentos();
    }
  }, [hotelId, isActive]);

  const fetchDescuentos = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/hotel/${hotelId}/descuentos`);
      setDescuentos(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar descuentos del hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const payload = {
        ...data,
        porcentaje: parseFloat(data.porcentaje) / 100
      };
      await axiosInstance.post(`/hotel/${hotelId}/descuentos`, payload);
      toast.success('Descuento agregado correctamente');
      setShowForm(false);
      await fetchDescuentos();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al agregar descuento');
      throw error;
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Tag className="h-5 w-5 text-indigo-500" />
            Descuentos por Cantidad
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure beneficios para clientes que reservan múltiples habitaciones simultáneamente.
          </p>
        </div>
        <AppButton
          onClick={() => setShowForm(true)}
          disabled={loading}
          icon={Plus}
        >
          Nuevo Descuento
        </AppButton>
      </div>

      <div className="flex-grow flex flex-col mt-6 overflow-hidden relative">
        <DescuentosList data={descuentos} loading={loading} />
      </div>

      <DescuentoFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleAdd}
      />
    </div>
  );
}

