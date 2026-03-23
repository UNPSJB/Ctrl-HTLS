import { useState, useEffect } from 'react';
import { Tag, Plus, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import DescuentosList from './DescuentosList';
import { 
  FormField, 
  NumberInput 
} from '@form';

export default function DescuentosSection({ hotelId }) {
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm();

  useEffect(() => {
    fetchDescuentos();
  }, [hotelId]);

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
      setSubmitting(true);
      await axiosInstance.post(`/hotel/${hotelId}/descuentos`, data);
      toast.success('Descuento agregado correctamente');
      setShowForm(false);
      form.reset();
      await fetchDescuentos();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al agregar descuento');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <section className="animate-in fade-in duration-300 space-y-6">
      {/* Encabezado + botón */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
            <Tag className="h-4 w-4 text-indigo-500" />
            Descuentos por Cantidad
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure beneficios para clientes que reservan múltiples habitaciones simultáneamente.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={loading || submitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className={`h-4 w-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
          {showForm ? 'Cancelar' : 'Nuevo Descuento'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 duration-300 dark:border-indigo-900/20 dark:bg-indigo-900/10">
          <form
            onSubmit={form.handleSubmit(handleAdd)}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 items-end"
          >
            <FormField label="Cantidad de Habitaciones" required error={form.formState.errors.cantidad_de_habitaciones}>
              <NumberInput
                min="1"
                placeholder="Ej: 3"
                {...form.register('cantidad_de_habitaciones', { required: true, min: 1 })}
              />
            </FormField>
            <FormField label="Porcentaje de Descuento (%)" required error={form.formState.errors.porcentaje}>
              <div className="flex items-center gap-2">
                <NumberInput
                  step="0.01"
                  min="0"
                  placeholder="Ej: 5.00"
                  {...form.register('porcentaje', { required: true, min: 0 })}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </FormField>
          </form>
        </div>
      )}

      {/* Tabla */}
      <DescuentosList data={descuentos} loading={loading} />

      {/* Nota informativa */}
      <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Los descuentos por volumen se aplican automáticamente en el motor de reservas cuando
          el cliente selecciona la cantidad de habitaciones indicada o superior.
        </p>
      </div>
    </section>
  );
}
