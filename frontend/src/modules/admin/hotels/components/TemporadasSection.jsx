import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import TemporadasList from './TemporadasList';
import { ActionModal } from '@admin-ui';
import { 
  FormField, 
  SelectInput, 
  TextInput, 
  NumberInput 
} from '@form';

export default function TemporadasSection({ hotelId }) {
  const [temporadas, setTemporadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm();

  useEffect(() => {
    fetchTemporadas();
  }, [hotelId]);

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
      setSubmitting(true);
      const payload = {
        ...data,
        porcentaje: parseFloat(data.porcentaje) / 100
      };
      await axiosInstance.post(`/hotel/${hotelId}/temporada`, payload);
      toast.success('Temporada agregada correctamente');
      setShowForm(false);
      form.reset();
      await fetchTemporadas();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al agregar temporada');
    } finally {
      setSubmitting(false);
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
    <section className="animate-in fade-in duration-300 space-y-6">
      {/* Encabezado + botón */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
            <Calendar className="h-4 w-4 text-blue-500" />
            Temporadas del Hotel
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestione periodos de alta y baja demanda con ajustes porcentuales automáticos.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={loading || submitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nueva Temporada
        </button>
      </div>

      {/* Modal de Temporada */}
      <ActionModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        title="Configurar Temporada"
        description="Defina un periodo de tiempo y su ajuste porcentual sobre la tarifa base."
        onConfirm={form.handleSubmit(handleAdd)}
        loading={submitting}
        confirmLabel="Registrar Temporada"
        confirmIcon={Plus}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Tipo de Ajuste" required error={form.formState.errors.tipo}>
              <SelectInput {...form.register('tipo', { required: true })}>
                <option value="alta">Temporada Alta (+ Aumento)</option>
                <option value="baja">Temporada Baja (- Descuento)</option>
              </SelectInput>
            </FormField>
          </div>
          
          <FormField label="Fecha de Inicio" required error={form.formState.errors.fechaInicio}>
            <TextInput
              type="date"
              {...form.register('fechaInicio', { required: true })}
            />
          </FormField>
          
          <FormField label="Fecha de Fin" required error={form.formState.errors.fechaFin}>
            <TextInput
              type="date"
              {...form.register('fechaFin', { required: true })}
            />
          </FormField>
          
          <div className="sm:col-span-2">
            <FormField label="Porcentaje de Ajuste (%)" required error={form.formState.errors.porcentaje}>
              <NumberInput
                placeholder="Ej: 15"
                {...form.register('porcentaje', { required: true, min: 0, max: 100 })}
              />
            </FormField>
          </div>
        </div>
      </ActionModal>

      {/* Tabla */}
      <TemporadasList data={temporadas} loading={loading} onDelete={handleDelete} />
    </section>
  );
}
