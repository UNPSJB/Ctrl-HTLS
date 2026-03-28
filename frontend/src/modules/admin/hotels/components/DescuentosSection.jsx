import { useState, useEffect } from 'react';
import { Tag, Plus, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import DescuentosList from './DescuentosList';
import { ActionModal } from '@admin-ui';
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
      const payload = {
        ...data,
        porcentaje: parseFloat(data.porcentaje) / 100
      };
      await axiosInstance.post(`/hotel/${hotelId}/descuentos`, payload);
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
          onClick={() => setShowForm(true)}
          disabled={loading || submitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nuevo Descuento
        </button>
      </div>

      {/* Modal de Descuento */}
      <ActionModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          form.reset();
        }}
        title="Configurar Descuento"
        description="Premie a clientes que reservan múltiples habitaciones simultáneamente."
        onConfirm={form.handleSubmit(handleAdd)}
        loading={submitting}
        confirmLabel="Registrar Descuento"
        confirmIcon={Plus}
        variant="indigo" // Usamos indigo para esta sección según el diseño original
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Cantidad de Habitaciones" required error={form.formState.errors.cantidad_de_habitaciones}>
            <NumberInput
              min="1"
              placeholder="Ej: 3"
              {...form.register('cantidad_de_habitaciones', { required: true, min: 1 })}
            />
          </FormField>

          <FormField label="Porcentaje de Descuento (%)" required error={form.formState.errors.porcentaje}>
            <NumberInput
              placeholder="Ej: 5"
              {...form.register('porcentaje', { required: true, min: 0, max: 100 })}
            />
          </FormField>
        </div>
      </ActionModal>

      {/* Tabla */}
      <DescuentosList data={descuentos} loading={loading} />
    </section>
  );
}
