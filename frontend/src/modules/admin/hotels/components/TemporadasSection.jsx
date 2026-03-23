import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import TemporadasList from './TemporadasList';
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
      await axiosInstance.post(`/hotel/${hotelId}/temporada`, data);
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
          onClick={() => setShowForm(!showForm)}
          disabled={loading || submitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className={`h-4 w-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
          {showForm ? 'Cancelar' : 'Nueva Temporada'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 duration-300 dark:border-blue-900/20 dark:bg-blue-900/10">
          <form
            onSubmit={form.handleSubmit(handleAdd)}
            className="grid grid-cols-1 gap-6 md:grid-cols-4 items-end"
          >
            <FormField label="Tipo" required error={form.formState.errors.tipo}>
              <SelectInput
                {...form.register('tipo', { required: true })}
              >
                <option value="alta">Temporada Alta (+)</option>
                <option value="baja">Temporada Baja (-)</option>
              </SelectInput>
            </FormField>
            <FormField label="Inicio" required error={form.formState.errors.fechaInicio}>
              <TextInput
                type="date"
                {...form.register('fechaInicio', { required: true })}
              />
            </FormField>
            <FormField label="Fin" required error={form.formState.errors.fechaFin}>
              <TextInput
                type="date"
                {...form.register('fechaFin', { required: true })}
              />
            </FormField>
            <FormField label="Ajuste (%)" required error={form.formState.errors.porcentaje}>
              <div className="flex items-center gap-2">
                <NumberInput
                  step="0.01"
                  placeholder="Ej: 15.00"
                  {...form.register('porcentaje', { required: true, min: 0 })}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 p-3 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </FormField>
          </form>
        </div>
      )}

      {/* Tabla */}
      <TemporadasList data={temporadas} loading={loading} onDelete={handleDelete} />
    </section>
  );
}
