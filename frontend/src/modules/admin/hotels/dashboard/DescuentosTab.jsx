import { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import DescuentosList from '../components/DescuentosList';
import { Modal } from '@admin-ui';
import {
  FormField,
  NumberInput
} from '@form';

export default function DescuentosTab({ hotelId, isActive = false }) {
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm();

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
        <button
          onClick={() => setShowForm(true)}
          disabled={loading || submitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nuevo Descuento
        </button>
      </div>

      <div className="flex-grow flex flex-col mt-6 overflow-hidden relative">

      {/* Modal de Descuento */}
        <Modal
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
                max="50"
                placeholder="Ej: 3"
                {...form.register('cantidad_de_habitaciones', {
                  required: 'La cantidad de habitaciones es obligatoria',
                  min: { value: 1, message: 'La cantidad mínima es 1 habitación' },
                  max: { value: 50, message: 'La cantidad máxima es 50 habitaciones' },
                })}
              />
            </FormField>

            <FormField label="Porcentaje de Descuento (%)" required error={form.formState.errors.porcentaje}>
              <NumberInput
                min="1"
                max="100"
                placeholder="Ej: 5"
                {...form.register('porcentaje', {
                  required: 'El porcentaje es obligatorio',
                  min: { value: 1, message: 'El porcentaje mínimo es 1%' },
                  max: { value: 100, message: 'El porcentaje máximo es 100%' },
                })}
              />
            </FormField>
          </div>
        </Modal>

        {/* Tabla */}
        <DescuentosList data={descuentos} loading={loading} />
      </div>
    </div>
  );
}
