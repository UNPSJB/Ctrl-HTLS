import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import TemporadasList from '../components/TemporadasList';
import TemporadaFormModal from '../components/TemporadaFormModal';
import AppButton from '@/components/ui/AppButton';

export default function TemporadasTab({ hotelId, isActive = false }) {
  const [temporadas, setTemporadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isActive) {
      fetchTemporadas();
    }
  }, [hotelId, isActive]);

  const fetchTemporadas = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/hotel/${hotelId}/temporadas`);
      setTemporadas(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar temporadas del hotel');
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
      await axiosInstance.post(`/hotel/${hotelId}/temporada`, payload);
      toast.success('Temporada agregada correctamente');
      setShowForm(false);
      await fetchTemporadas();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al agregar temporada');
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirma eliminar esta temporada?')) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/hotel/${hotelId}/temporada/${id}`);
      toast.success('Temporada eliminada');
      await fetchTemporadas();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-blue-500" />
            Temporadas del Hotel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestione periodos de alta y baja demanda con ajustes porcentuales automáticos.
          </p>
        </div>
        <AppButton
          onClick={() => setShowForm(true)}
          disabled={loading}
          icon={Plus}
        >
          Nueva Temporada
        </AppButton>
      </div>

      <div className="flex-grow flex flex-col mt-6 overflow-hidden relative">
        <TemporadasList data={temporadas} loading={loading} onDelete={handleDelete} />
      </div>

      <TemporadaFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleAdd}
      />
    </div>
  );
}

