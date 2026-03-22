import { useState, useEffect } from 'react';
import { Tag, Plus, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

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
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Cantidad de Habitaciones
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ej: 3"
                {...form.register('cantidad_de_habitaciones', { required: true, min: 1 })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Porcentaje de Descuento (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 5.00"
                  {...form.register('porcentaje', { required: true, min: 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="relative flex flex-col min-h-[160px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
            <InnerLoading message="Sincronizando descuentos..." />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Mínimo de Habitaciones</th>
                <th className="px-4 py-3 text-center">Descuento (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {descuentos.length === 0 && !loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-12 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="h-8 w-8 opacity-20" />
                      <p>No hay descuentos configurados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                descuentos.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                      {d.cantidad_de_habitaciones} {d.cantidad_de_habitaciones === 1 ? 'habitación' : 'habitaciones'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {parseInt(d.porcentaje)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
