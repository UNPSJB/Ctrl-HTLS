import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

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
            className="grid grid-cols-1 gap-6 md:grid-cols-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tipo</label>
              <select
                {...form.register('tipo', { required: true })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="alta">Temporada Alta (+)</option>
                <option value="baja">Temporada Baja (-)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Inicio</label>
              <input
                type="date"
                {...form.register('fechaInicio', { required: true })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fin</label>
              <input
                type="date"
                {...form.register('fechaFin', { required: true })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ajuste (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 15.00"
                  {...form.register('porcentaje', { required: true, min: 0 })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="relative flex flex-col min-h-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
            <InnerLoading message="Sincronizando temporadas..." />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3 text-center">Ajuste</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {temporadas.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8 opacity-20" />
                      <p>No hay temporadas configuradas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                temporadas.map((t) => (
                  <tr key={t.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-sm">
                        {t.tipo === 'alta' ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span className={t.tipo === 'alta' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}>
                          {t.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(t.fechaInicio).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(t.fechaFin).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {parseInt(t.porcentaje)}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={loading}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
